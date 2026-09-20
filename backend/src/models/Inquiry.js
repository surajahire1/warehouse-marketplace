import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['CUSTOMER', 'MANAGER', 'ADMIN'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const inquirySchema = new mongoose.Schema(
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
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: [messageSchema],
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN',
    },
    unreadCustomerCount: {
      type: Number,
      default: 0,
    },
    unreadManagerCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique inquiry per customer and warehouse pair
inquirySchema.index({ warehouseId: 1, customerId: 1 }, { unique: true });
inquirySchema.index({ managerId: 1, lastMessageAt: -1 });
inquirySchema.index({ customerId: 1, lastMessageAt: -1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
