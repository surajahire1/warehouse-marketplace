import * as bookingService from '../services/booking.service.js';
import { Booking } from '../models/Booking.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, quantity } = req.query;

    const availability = await bookingService.checkWarehouseAvailability(
      id,
      startDate,
      endDate,
      quantity ? parseFloat(quantity) : 0
    );

    res.status(200).json(new ApiResponse(200, availability, 'Availability calculated successfully'));
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, booking, 'Booking created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('warehouseId', 'title address images capacityUnit pricePerUnitPerDay')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, bookings, 'Customer bookings retrieved'));
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const updated = await bookingService.updateBookingStatus(
      id,
      status,
      req.user._id,
      req.user.role,
      reason
    );

    res.status(200).json(new ApiResponse(200, updated, 'Booking status updated'));
  } catch (error) {
    next(error);
  }
};
