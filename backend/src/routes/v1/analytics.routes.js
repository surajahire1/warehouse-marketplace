import { Router } from 'express';
import * as analyticsController from '../../controllers/analytics.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../models/User.js';

const router = Router();

// Manager/Host Analytics Endpoint
router.get(
  '/manager',
  authenticate,
  authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  analyticsController.getManagerAnalytics
);

export default router;
