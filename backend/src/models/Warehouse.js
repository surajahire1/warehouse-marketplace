import mongoose from 'mongoose';

export const CAPACITY_UNITS = {
  SQFT: 'SQFT',
  PALLET: 'PALLET',
  CUBIC_METER: 'CUBIC_METER',
};

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const warehouseSchema = new mongoose.Schema(
  {
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Manager ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Warehouse title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 4000,
    },
    // GeoJSON Point for MongoDB 2dsphere proximity search
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - NOTE: Longitude first!
        required: [true, 'Coordinates [longitude, latitude] are required'],
      },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Total capacity must be greater than 0'],
    },
    capacityUnit: {
      type: String,
      enum: Object.values(CAPACITY_UNITS),
      default: CAPACITY_UNITS.SQFT,
      required: true,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
      required: true,
    },
    pricePerUnitPerDay: {
      type: Number,
      required: [true, 'Price per unit per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    minBookingDays: {
      type: Number,
      default: 1,
      min: 1,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for nearSphere and geo queries
warehouseSchema.index({ location: '2dsphere' });

// Compound index for active approved search queries
warehouseSchema.index({ verificationStatus: 1, isActive: 1, 'address.city': 1 });

export const Warehouse = mongoose.model('Warehouse', warehouseSchema);
