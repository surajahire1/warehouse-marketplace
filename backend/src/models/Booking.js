import mongoose from 'mongoose';

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const bookingSchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse ID is required'],
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true,
    },
    quantityBooked: {
      type: Number,
      required: [true, 'Quantity booked is required'],
      min: [1, 'Quantity booked must be at least 1'],
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be non-negative'],
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    paymentId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Crucial compound index for lightning-fast overlapping booking queries
bookingSchema.index({
  warehouseId: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

export const Booking = mongoose.model('Booking', bookingSchema);
