import * as reviewService from '../services/review.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createReview = async (req, res, next) => {
  try {
    const { bookingId, ...reviewData } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const review = await reviewService.createReview(req.user._id, bookingId, reviewData);
    res.status(201).json(new ApiResponse(201, review, 'Verified review submitted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getWarehouseReviews = async (req, res, next) => {
  try {
    const { warehouseId } = req.params;
    const result = await reviewService.getWarehouseReviews(warehouseId, req.query);
    res.status(200).json(new ApiResponse(200, result, 'Warehouse reviews retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getBookingReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const review = await reviewService.getCustomerReviewForBooking(bookingId, req.user._id);
    res.status(200).json(new ApiResponse(200, review, 'Booking review retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getCustomerReviews(req.user._id);
    res.status(200).json(new ApiResponse(200, reviews, 'Customer reviews retrieved'));
  } catch (error) {
    next(error);
  }
};
