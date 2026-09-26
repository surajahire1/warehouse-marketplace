import { z } from 'zod';
import { USER_ROLES } from '../models/User.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().max(100).optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.MANAGER]).default(USER_ROLES.CUSTOMER),
    phone: z
      .string({ required_error: 'Mobile phone number is required' })
      .trim()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number cannot exceed 20 characters')
      .regex(/^[+0-9\s-]{7,20}$/, 'Invalid phone number format'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().max(100).optional(),
    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number cannot exceed 20 digits')
      .regex(/^[+0-9\s-]{7,20}$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    dob: z
      .string()
      .optional()
      .nullable()
      .or(z.literal('')),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});
