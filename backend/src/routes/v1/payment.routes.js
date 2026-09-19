import { Router } from 'express';
import * as paymentController from '../../controllers/payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../models/User.js';

const router = Router();

// Create Razorpay payment order for a warehouse booking
router.post(
  '/create-order',
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  paymentController.createOrder
);

// Verify Razorpay payment signature and secure funds in escrow
router.post(
  '/verify',
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  paymentController.verifyPayment
);

export default router;
