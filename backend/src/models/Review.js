import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // Only one review per verified booking
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    dockSpeedRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    securityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    cleanlinessRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    hostResponsivenessRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    facilityTypeUsed: {
      type: String,
      default: 'General Commercial Storage',
      trim: true,
    },
    comment: {
      type: String,
      maxlength: 2000,
      default: '',
      trim: true,
    },
    verifiedBooking: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ warehouseId: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
