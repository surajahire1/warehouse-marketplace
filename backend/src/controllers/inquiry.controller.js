import * as inquiryService from '../services/inquiry.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getWarehouseInquiry = async (req, res, next) => {
  try {
    const { warehouseId } = req.params;
    const inquiry = await inquiryService.getOrCreateWarehouseInquiry(warehouseId, req.user._id);
    res.status(200).json(new ApiResponse(200, inquiry, 'Inquiry thread retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inquiry = await inquiryService.getInquiryById(id, req.user._id, req.user.role);
    res.status(200).json(new ApiResponse(200, inquiry, 'Inquiry conversation loaded'));
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const updatedInquiry = await inquiryService.sendMessage(id, req.user, text);
    res.status(200).json(new ApiResponse(200, updatedInquiry, 'Message sent successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMyInquiries = async (req, res, next) => {
  try {
    let inquiries;
    if (req.user.role === 'MANAGER') {
      inquiries = await inquiryService.getManagerInquiries(req.user._id);
    } else {
      inquiries = await inquiryService.getCustomerInquiries(req.user._id);
    }
    res.status(200).json(new ApiResponse(200, inquiries, 'Inquiries retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getManagerInquiries = async (req, res, next) => {
  try {
    const inquiries = await inquiryService.getManagerInquiries(req.user._id);
    res.status(200).json(new ApiResponse(200, inquiries, 'Host inquiries retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inquiry = await inquiryService.markInquiryAsRead(id, req.user._id, req.user.role);
    res.status(200).json(new ApiResponse(200, inquiry, 'Inquiry marked as read'));
  } catch (error) {
    next(error);
  }
};
