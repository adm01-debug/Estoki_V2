import { z } from 'zod';

export const packageSchema = z.object({
  id: z.string().uuid(),
  package_number: z.string(),
  weight_kg: z.number().positive(),
  width_cm: z.number().positive(),
  height_cm: z.number().positive(),
  depth_cm: z.number().positive(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    serial_numbers: z.array(z.string()).optional(),
  })),
});

export const packingSchema = z.object({
  id: z.string().uuid(),
  packing_number: z.string(),
  order_id: z.string().uuid(),
  picking_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  packer_id: z.string().uuid().nullable().optional(),
  station_id: z.string().nullable().optional(),
  packages: z.array(packageSchema).default([]),
  total_packages: z.number().int().nonnegative().default(0),
  total_weight_kg: z.number().nonnegative().default(0),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const packingCreateSchema = packingSchema.omit({ id: true, created_at: true, updated_at: true, packing_number: true });
export type Packing = z.infer<typeof packingSchema>;
