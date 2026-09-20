import { Router } from 'express';
import * as reviewController from '../../controllers/review.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public: Retrieve verified reviews and category breakdown for a warehouse
router.get('/warehouse/:warehouseId', reviewController.getWarehouseReviews);

// Protected routes
router.use(authenticate);

// Submit a new verified review
router.post('/', reviewController.createReview);

// Check if customer already reviewed a specific booking
router.get('/booking/:bookingId', reviewController.getBookingReview);

// Get all reviews written by current customer
router.get('/user/my', reviewController.getMyReviews);

export default router;
