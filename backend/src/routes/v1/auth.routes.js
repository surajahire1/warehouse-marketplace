import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../../validations/auth.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
