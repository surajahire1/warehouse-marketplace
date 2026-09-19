import { z } from 'zod';

export const checkAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ObjectId'),
  }),
  query: z.object({
    startDate: z.string().datetime({ offset: true }).or(z.string().date()),
    endDate: z.string().datetime({ offset: true }).or(z.string().date()),
    quantity: z.coerce.number().positive(),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    warehouseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ObjectId'),
    startDate: z.string().datetime({ offset: true }).or(z.string().date()),
    endDate: z.string().datetime({ offset: true }).or(z.string().date()),
    quantityBooked: z.number().positive(),
  }),
});
