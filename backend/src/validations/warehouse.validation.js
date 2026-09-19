import { z } from 'zod';
import { CAPACITY_UNITS } from '../models/Warehouse.js';

export const createWarehouseSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().default('US'),
    }),
    totalCapacity: z.number().positive('Total capacity must be > 0'),
    capacityUnit: z.nativeEnum(CAPACITY_UNITS),
    pricePerUnitPerDay: z.number().nonnegative(),
    minBookingDays: z.number().int().positive().default(1),
    amenities: z.array(z.string()).optional().default([]),
    images: z.array(z.string()).optional().default([]),
  }),
});

export const searchWarehouseSchema = z.object({
  query: z.object({
    longitude: z.coerce.number().min(-180).max(180).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    radiusKm: z.coerce.number().positive().default(50),
    city: z.string().optional(),
    minCapacity: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    capacityUnit: z.nativeEnum(CAPACITY_UNITS).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});
