import { Router } from 'express';
import * as bookingController from '../../controllers/booking.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { checkAvailabilitySchema, createBookingSchema } from '../../validations/booking.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../models/User.js';

const router = Router();

// Public availability check
router.get(
  '/warehouses/:id/availability',
  validate(checkAvailabilitySchema),
  bookingController.checkAvailability
);

// Protected booking actions
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get('/my-bookings', authenticate, bookingController.getMyBookings);

// Host/Manager incoming reservation requests for their warehouses
router.get(
  '/manager/incoming-requests',
  authenticate,
  authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  bookingController.getManagerRequests
);

router.patch('/:id/status', authenticate, bookingController.updateStatus);

export default router;
