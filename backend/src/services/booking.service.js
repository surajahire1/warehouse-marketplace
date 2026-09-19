import mongoose from 'mongoose';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { Warehouse, VERIFICATION_STATUS } from '../models/Warehouse.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Calculates peak occupied capacity across overlapping bookings within [reqStart, reqEnd]
 * Uses an exact timeline event algorithm (O(N log N) sweep-line).
 */
export const calculatePeakOccupancy = (overlappingBookings, reqStart, reqEnd) => {
  // Event: { time: Date, delta: +quantity or -quantity }
  const events = [];

  for (const booking of overlappingBookings) {
    const bStart = new Date(booking.startDate);
    const bEnd = new Date(booking.endDate);

    // Only consider the portion of the booking that intersects with [reqStart, reqEnd]
    const effectiveStart = bStart < reqStart ? reqStart : bStart;
    const effectiveEnd = bEnd > reqEnd ? reqEnd : bEnd;

    events.push({ time: effectiveStart.getTime(), delta: booking.quantityBooked });
    events.push({ time: effectiveEnd.getTime(), delta: -booking.quantityBooked });
  }

  // Sort events chronologically.
  // If an end event and start event occur at the exact same millisecond,
  // process the end (-delta) first to free up space.
  events.sort((a, b) => {
    if (a.time === b.time) return a.delta - b.delta;
    return a.time - b.time;
  });

  let currentOccupancy = 0;
  let peakOccupancy = 0;

  for (const event of events) {
    currentOccupancy += event.delta;
    if (currentOccupancy > peakOccupancy) {
      peakOccupancy = currentOccupancy;
    }
  }

  return peakOccupancy;
};

/**
 * Checks warehouse space availability for a requested quantity and date range.
 */
export const checkWarehouseAvailability = async (warehouseId, startDateStr, endDateStr, requestedQuantity = 0) => {
  const reqStart = new Date(startDateStr);
  const reqEnd = new Date(endDateStr);

  if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime())) {
    throw new ApiError(400, 'Invalid startDate or endDate format');
  }

  if (reqStart >= reqEnd) {
    throw new ApiError(400, 'endDate must be strictly after startDate');
  }

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse || !warehouse.isActive) {
    throw new ApiError(404, 'Warehouse not found or is currently inactive');
  }

  if (warehouse.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    throw new ApiError(400, 'Warehouse is not approved for public bookings');
  }

  const durationDays = Math.max(1, Math.ceil((reqEnd - reqStart) / (1000 * 60 * 60 * 24)));
  if (durationDays < warehouse.minBookingDays) {
    throw new ApiError(
      400,
      `Minimum booking duration for this warehouse is ${warehouse.minBookingDays} day(s)`
    );
  }

  // Find all active/confirmed/pending bookings that overlap with [reqStart, reqEnd]
  // Mathematical overlap: booking.startDate < reqEnd AND booking.endDate > reqStart
  const overlappingBookings = await Booking.find({
    warehouseId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE] },
    startDate: { $lt: reqEnd },
    endDate: { $gt: reqStart },
  }).select('startDate endDate quantityBooked status');

  const peakOccupied = calculatePeakOccupancy(overlappingBookings, reqStart, reqEnd);
  const availableCapacity = warehouse.totalCapacity - peakOccupied;
  const isAvailable = availableCapacity >= requestedQuantity;

  const estimatedTotal = durationDays * requestedQuantity * warehouse.pricePerUnitPerDay;

  return {
    warehouseId: warehouse._id,
    warehouseTitle: warehouse.title,
    capacityUnit: warehouse.capacityUnit,
    currency: warehouse.currency || 'INR',
    totalCapacity: warehouse.totalCapacity,
    peakOccupied,
    availableCapacity,
    requestedQuantity,
    isAvailable,
    durationDays,
    pricePerUnitPerDay: warehouse.pricePerUnitPerDay,
    estimatedTotal: Math.round(estimatedTotal * 100) / 100,
  };
};

/**
 * Creates a new booking atomically.
 */
export const createBooking = async (customerId, bookingData) => {
  const { warehouseId, startDate, endDate, quantityBooked } = bookingData;

  const availability = await checkWarehouseAvailability(
    warehouseId,
    startDate,
    endDate,
    quantityBooked
  );

  if (!availability.isAvailable) {
    throw new ApiError(
      409,
      `Insufficient capacity available for the selected dates. Requested: ${quantityBooked} ${availability.capacityUnit}, Available: ${availability.availableCapacity} ${availability.capacityUnit}`
    );
  }

  const booking = await Booking.create({
    warehouseId,
    customerId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    quantityBooked,
    currency: availability.currency,
    totalAmount: availability.estimatedTotal,
    status: BOOKING_STATUS.PENDING,
  });

  return booking;
};

/**
 * Updates booking status lifecycle (Confirm, Cancel, Activate, Complete).
 */
export const updateBookingStatus = async (bookingId, newStatus, userId, userRole, reason = '') => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const warehouse = await Warehouse.findById(booking.warehouseId);

  // Authorization checks
  if (userRole === 'CUSTOMER' && booking.customerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to modify this booking');
  }

  if (userRole === 'MANAGER' && warehouse.managerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to modify bookings for this warehouse');
  }

  booking.status = newStatus;
  if (reason) {
    booking.cancellationReason = reason;
  }

  // Escrow lifecycle handling
  if (newStatus === 'CANCELLED' && booking.paymentStatus === 'HELD_IN_ESCROW') {
    booking.paymentStatus = 'REFUNDED';
  } else if (newStatus === 'COMPLETED' && booking.paymentStatus === 'HELD_IN_ESCROW') {
    booking.paymentStatus = 'DISBURSED';
  }

  await booking.save();
  return booking;
};

/**
 * Retrieves all bookings placed on warehouses owned by a specific host/manager.
 */
export const getBookingsForManager = async (managerId) => {
  const warehouses = await Warehouse.find({ managerId }).select('_id');
  const warehouseIds = warehouses.map((w) => w._id);

  return Booking.find({ warehouseId: { $in: warehouseIds } })
    .populate('warehouseId', 'title address currency totalCapacity capacityUnit pricePerUnitPerDay')
    .populate('customerId', 'name email phone')
    .sort({ createdAt: -1 });
};
