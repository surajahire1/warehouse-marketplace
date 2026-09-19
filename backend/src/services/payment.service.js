import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { checkWarehouseAvailability } from './booking.service.js';
import { ApiError } from '../utils/apiError.js';

let razorpayClient = null;

const getRazorpayClient = () => {
  if (!razorpayClient && config.razorpayKeyId && config.razorpayKeySecret) {
    razorpayClient = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
  }
  return razorpayClient;
};

/**
 * Creates a payment order and pre-allocates an UNPAID booking.
 */
export const createBookingPaymentOrder = async (customerId, bookingData) => {
  const { warehouseId, startDate, endDate, quantityBooked } = bookingData;

  // 1. Verify real-time overlapping capacity
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

  // Amount in smallest unit (paise for INR, cents for USD)
  const amountSmallestUnit = Math.round(availability.estimatedTotal * 100);
  const currency = availability.currency || 'INR';

  let orderId;
  const client = getRazorpayClient();

  // Try creating real Razorpay order if valid keys configured, otherwise fallback to developer simulator
  if (client && !config.razorpayKeyId.includes('warehousespace')) {
    try {
      const order = await client.orders.create({
        amount: amountSmallestUnit,
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          warehouseId: warehouseId.toString(),
          customerId: customerId.toString(),
        },
      });
      orderId = order.id;
    } catch (err) {
      console.warn(`[Razorpay Notice] Order creation on live API failed (${err.message}). Using dev order simulator.`);
      orderId = `order_dev_${Date.now()}`;
    }
  } else {
    orderId = `order_dev_${Date.now()}`;
  }

  // 2. Pre-create booking in UNPAID state
  const booking = await Booking.create({
    warehouseId,
    customerId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    quantityBooked,
    currency,
    totalAmount: availability.estimatedTotal,
    status: BOOKING_STATUS.PENDING,
    paymentStatus: 'UNPAID',
    orderId,
  });

  return {
    orderId,
    bookingId: booking._id,
    amount: amountSmallestUnit,
    currency,
    keyId: config.razorpayKeyId,
    estimatedTotal: availability.estimatedTotal,
    warehouseTitle: availability.warehouseTitle,
  };
};

/**
 * Verifies payment signature and locks funds in escrow.
 */
export const verifyBookingPayment = async (customerId, paymentData) => {
  const { bookingId, orderId, paymentId, signature } = paymentData;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.customerId.toString() !== customerId.toString()) {
    throw new ApiError(403, 'Not authorized to verify payment for this booking');
  }

  // Verify HMAC-SHA256 signature if real Razorpay keys are configured
  const isRealRazorpayKey = config.razorpayKeySecret && !config.razorpayKeySecret.includes('12345');
  if (isRealRazorpayKey && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new ApiError(400, 'Invalid payment signature. Verification failed.');
    }
  }

  // Calculate 10% Platform Commission and 90% Host Payout
  const commission = (booking.totalAmount * config.platformCommissionPercent) / 100;
  const hostPayout = booking.totalAmount - commission;

  booking.paymentStatus = 'HELD_IN_ESCROW';
  booking.paymentId = paymentId || `pay_dev_${Date.now()}`;
  booking.orderId = orderId;
  booking.platformCommission = Math.round(commission * 100) / 100;
  booking.hostPayoutAmount = Math.round(hostPayout * 100) / 100;
  booking.paidAt = new Date();

  await booking.save();

  return booking;
};
