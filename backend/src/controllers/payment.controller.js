import * as paymentService from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createOrder = async (req, res, next) => {
  try {
    const orderData = await paymentService.createBookingPaymentOrder(req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, orderData, 'Payment order created successfully'));
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const verifiedBooking = await paymentService.verifyBookingPayment(req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, verifiedBooking, 'Payment verified and secured in escrow'));
  } catch (error) {
    next(error);
  }
};
