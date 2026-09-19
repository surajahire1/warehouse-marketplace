import { Router } from 'express';
import authRoutes from './auth.routes.js';
import warehouseRoutes from './warehouse.routes.js';
import bookingRoutes from './booking.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/bookings', bookingRoutes);

export default router;
