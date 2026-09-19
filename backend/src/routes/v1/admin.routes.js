import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../models/User.js';

const router = Router();

// Retrieve all registered users
router.get(
  '/users',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  adminController.getAllUsers
);

// Review & verify warehouse listings
router.get(
  '/warehouses/pending',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  adminController.getPendingWarehouses
);

router.patch(
  '/warehouses/:id/verification',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  adminController.verifyWarehouse
);

export default router;
