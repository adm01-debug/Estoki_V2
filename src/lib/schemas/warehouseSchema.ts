import { z } from 'zod';

export const warehouseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(20),
  name: z.string().min(2),
  type: z.enum(['main', 'branch', 'transit', 'third_party']).default('main'),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip_code: z.string(),
    country: z.string().default('BR'),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
  }),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  manager_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().default(true),
  capacity_m3: z.number().positive().nullable().optional(),
  working_hours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).nullable(),
    tuesday: z.object({ open: z.string(), close: z.string() }).nullable(),
    wednesday: z.object({ open: z.string(), close: z.string() }).nullable(),
    thursday: z.object({ open: z.string(), close: z.string() }).nullable(),
    friday: z.object({ open: z.string(), close: z.string() }).nullable(),
    saturday: z.object({ open: z.string(), close: z.string() }).nullable(),
    sunday: z.object({ open: z.string(), close: z.string() }).nullable(),
  }).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const warehouseCreateSchema = warehouseSchema.omit({ id: true, created_at: true, updated_at: true });
export const warehouseUpdateSchema = warehouseCreateSchema.partial();

export type Warehouse = z.infer<typeof warehouseSchema>;
export type WarehouseCreate = z.infer<typeof warehouseCreateSchema>;
export type WarehouseUpdate = z.infer<typeof warehouseUpdateSchema>;
