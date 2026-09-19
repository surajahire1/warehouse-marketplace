import { z } from 'zod';
import { USER_ROLES } from '../models/User.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must have at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.MANAGER]).default(USER_ROLES.CUSTOMER),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
