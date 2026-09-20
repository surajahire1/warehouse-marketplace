import { Inquiry } from '../models/Inquiry.js';
import { Warehouse } from '../models/Warehouse.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Retrieves an existing inquiry thread or creates a new one for a warehouse and customer.
 */
export const getOrCreateWarehouseInquiry = async (warehouseId, customerId) => {
  const warehouse = await Warehouse.findById(warehouseId).populate('managerId', 'name email phone avatar');
  if (!warehouse) {
    throw new ApiError(404, 'Warehouse facility not found');
  }

  let inquiry = await Inquiry.findOne({ warehouseId, customerId })
    .populate('customerId', 'name email phone avatar')
    .populate('managerId', 'name email phone avatar')
    .populate('warehouseId', 'title address images capacityUnit pricePerUnitPerDay minBookingDays');

  if (!inquiry) {
    inquiry = await Inquiry.create({
      warehouseId,
      customerId,
      managerId: warehouse.managerId._id || warehouse.managerId,
      messages: [],
      lastMessage: '',
      lastMessageAt: new Date(),
      status: 'OPEN',
    });

    inquiry = await Inquiry.findById(inquiry._id)
      .populate('customerId', 'name email phone avatar')
      .populate('managerId', 'name email phone avatar')
      .populate('warehouseId', 'title address images capacityUnit pricePerUnitPerDay minBookingDays');
  } else {
    // Clear unread count for customer when they open the inquiry
    if (inquiry.unreadCustomerCount > 0) {
      inquiry.unreadCustomerCount = 0;
      await inquiry.save();
    }
  }

  return inquiry;
};

/**
 * Retrieves a single inquiry by ID with authorization verification.
 */
export const getInquiryById = async (inquiryId, userId, userRole) => {
  const inquiry = await Inquiry.findById(inquiryId)
    .populate('customerId', 'name email phone avatar')
    .populate('managerId', 'name email phone avatar')
    .populate('warehouseId', 'title address images capacityUnit pricePerUnitPerDay minBookingDays');

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry conversation not found');
  }

  const customerIdStr = (inquiry.customerId?._id || inquiry.customerId)?.toString();
  const managerIdStr = (inquiry.managerId?._id || inquiry.managerId)?.toString();
  const isCustomer = customerIdStr === userId.toString();
  const isManager = managerIdStr === userId.toString();

  if (!isCustomer && !isManager && userRole !== 'ADMIN') {
    throw new ApiError(403, 'Not authorized to view this inquiry thread');
  }

  return inquiry;
};

/**
 * Adds a new message to an inquiry conversation.
 */
export const sendMessage = async (inquiryId, senderUser, text) => {
  if (!text || !text.trim()) {
    throw new ApiError(400, 'Message text cannot be empty');
  }

  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new ApiError(404, 'Inquiry conversation not found');
  }

  const isCustomer = inquiry.customerId.toString() === senderUser._id.toString();
  const isManager = inquiry.managerId.toString() === senderUser._id.toString();

  if (!isCustomer && !isManager && senderUser.role !== 'ADMIN') {
    throw new ApiError(403, 'Not authorized to send messages in this inquiry');
  }

  const newMessage = {
    senderId: senderUser._id,
    senderRole: senderUser.role,
    senderName: senderUser.name,
    text: text.trim(),
    createdAt: new Date(),
    read: false,
  };

  inquiry.messages.push(newMessage);
  inquiry.lastMessage = text.trim().substring(0, 200);
  inquiry.lastMessageAt = new Date();

  // Increment unread count for the opposite participant
  if (isCustomer) {
    inquiry.unreadManagerCount += 1;
  } else {
    inquiry.unreadCustomerCount += 1;
  }

  await inquiry.save();

  return Inquiry.findById(inquiryId)
    .populate('customerId', 'name email phone avatar')
    .populate('managerId', 'name email phone avatar')
    .populate('warehouseId', 'title address images capacityUnit pricePerUnitPerDay minBookingDays');
};

/**
 * Retrieves all inquiries initiated by a customer.
 */
export const getCustomerInquiries = async (customerId) => {
  return Inquiry.find({ customerId })
    .populate('managerId', 'name email phone avatar')
    .populate('warehouseId', 'title address images capacityUnit pricePerUnitPerDay minBookingDays')
    .sort({ lastMessageAt: -1 });
};

/**
 * Retrieves all inquiries received by a warehouse manager across their facilities.
 */
export const getManagerInquiries = async (managerId) => {
  return Inquiry.find({ managerId })
    .populate('customerId', 'name email phone avatar')
    .populate('warehouseId', 'title address images capacityUnit pricePerUnitPerDay minBookingDays')
    .sort({ lastMessageAt: -1 });
};

/**
 * Resets unread counter for a specific user role.
 */
export const markInquiryAsRead = async (inquiryId, userId, userRole) => {
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  const isCustomer = inquiry.customerId.toString() === userId.toString();
  const isManager = inquiry.managerId.toString() === userId.toString();

  if (isCustomer) {
    inquiry.unreadCustomerCount = 0;
  } else if (isManager || userRole === 'ADMIN') {
    inquiry.unreadManagerCount = 0;
  }

  await inquiry.save();
  return inquiry;
};
