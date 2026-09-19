import { Router } from 'express';
import * as warehouseController from '../../controllers/warehouse.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createWarehouseSchema, searchWarehouseSchema } from '../../validations/warehouse.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { USER_ROLES } from '../../models/User.js';

const router = Router();

// Manager my-warehouses listing
router.get(
  '/manager/my-warehouses',
  authenticate,
  authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  warehouseController.getMyWarehouses
);

// Public search & details
router.get('/', validate(searchWarehouseSchema), warehouseController.searchWarehouses);
router.get('/:id', warehouseController.getWarehouseById);

// Manager creation & management
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  validate(createWarehouseSchema),
  warehouseController.createWarehouse
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  warehouseController.updateWarehouse
);

export default router;
