import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Warehouse } from '../models/Warehouse.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Creates a verified review for a confirmed/active/completed booking.
 */
export const createReview = async (customerId, bookingId, reviewData) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking reservation not found');
  }

  if (booking.customerId.toString() !== customerId.toString()) {
    throw new ApiError(403, 'You are not authorized to review this reservation');
  }

  // Only allowed for confirmed, active, or completed bookings
  const validStatuses = ['CONFIRMED', 'ACTIVE', 'COMPLETED'];
  if (!validStatuses.includes(booking.status)) {
    throw new ApiError(400, 'Only confirmed, active, or completed bookings can be reviewed');
  }

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new ApiError(409, 'You have already submitted a review for this booking');
  }

  const {
    overallRating,
    dockSpeedRating = 5,
    securityRating = 5,
    cleanlinessRating = 5,
    hostResponsivenessRating = 5,
    facilityTypeUsed = 'General Commercial Storage',
    comment = '',
  } = reviewData;

  const parsedRating = Number(overallRating);
  if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
    throw new ApiError(400, 'Overall rating must be between 1 and 5');
  }

  const review = await Review.create({
    warehouseId: booking.warehouseId,
    customerId,
    bookingId,
    overallRating: parsedRating,
    dockSpeedRating: Number(dockSpeedRating) || 5,
    securityRating: Number(securityRating) || 5,
    cleanlinessRating: Number(cleanlinessRating) || 5,
    hostResponsivenessRating: Number(hostResponsivenessRating) || 5,
    facilityTypeUsed,
    comment: comment.trim(),
    verifiedBooking: true,
  });

  // Automatically recalculate aggregate warehouse rating
  await recalculateWarehouseRating(booking.warehouseId);

  return Review.findById(review._id).populate('customerId', 'name email avatar');
};

/**
 * Recalculates average rating and review count for a facility.
 */
export const recalculateWarehouseRating = async (warehouseId) => {
  const stats = await Review.aggregate([
    { $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) } },
    {
      $group: {
        _id: '$warehouseId',
        avgRating: { $avg: '$overallRating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewCount = stats.length > 0 ? stats[0].count : 0;

  await Warehouse.findByIdAndUpdate(warehouseId, { averageRating, reviewCount });
  return { averageRating, reviewCount };
};

/**
 * Retrieves paginated reviews and category metrics summary for a facility.
 */
export const getWarehouseReviews = async (warehouseId, query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const objectId = new mongoose.Types.ObjectId(warehouseId);

  const [reviews, total, categoryStats] = await Promise.all([
    Review.find({ warehouseId: objectId })
      .populate('customerId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ warehouseId: objectId }),
    Review.aggregate([
      { $match: { warehouseId: objectId } },
      {
        $group: {
          _id: '$warehouseId',
          avgOverall: { $avg: '$overallRating' },
          avgDockSpeed: { $avg: '$dockSpeedRating' },
          avgSecurity: { $avg: '$securityRating' },
          avgCleanliness: { $avg: '$cleanlinessRating' },
          avgHost: { $avg: '$hostResponsivenessRating' },
          fiveStar: { $sum: { $cond: [{ $eq: ['$overallRating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$overallRating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$overallRating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$overallRating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$overallRating', 1] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const stats = categoryStats[0] || {};
  const round = (val) => (val ? Math.round(val * 10) / 10 : 5.0);

  const summary = {
    averageRating: stats.avgOverall ? Math.round(stats.avgOverall * 10) / 10 : 0,
    totalReviews: total,
    categories: {
      dockSpeed: round(stats.avgDockSpeed),
      security: round(stats.avgSecurity),
      cleanliness: round(stats.avgCleanliness),
      hostResponsiveness: round(stats.avgHost),
    },
    distribution: {
      5: stats.fiveStar || 0,
      4: stats.fourStar || 0,
      3: stats.threeStar || 0,
      2: stats.twoStar || 0,
      1: stats.oneStar || 0,
    },
  };

  return {
    reviews,
    summary,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Checks if a customer has already reviewed a booking.
 */
export const getCustomerReviewForBooking = async (bookingId, customerId) => {
  return Review.findOne({ bookingId, customerId }).populate('customerId', 'name email avatar');
};

/**
 * Retrieves all reviews written by a customer.
 */
export const getCustomerReviews = async (customerId) => {
  return Review.find({ customerId })
    .populate('warehouseId', 'title address images')
    .sort({ createdAt: -1 });
};
