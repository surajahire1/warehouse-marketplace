import { Router } from 'express';
import * as inquiryController from '../../controllers/inquiry.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../models/User.js';

const router = Router();

// All inquiry routes require authentication
router.use(authenticate);

// Get inquiries for current user (customer threads or manager inbox)
router.get('/user/my', inquiryController.getMyInquiries);
router.get('/customer/my', inquiryController.getMyInquiries);

// Explicit manager inquiries endpoint
router.get(
  '/host/inbox',
  authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  inquiryController.getManagerInquiries
);

// Get or start an inquiry thread for a specific warehouse
router.get('/warehouse/:warehouseId', inquiryController.getWarehouseInquiry);

// Retrieve a specific inquiry conversation
router.get('/:id', inquiryController.getInquiryById);

// Send a message within an inquiry
router.post('/:id/messages', inquiryController.sendMessage);

// Mark an inquiry as read
router.patch('/:id/read', inquiryController.markAsRead);

export default router;
