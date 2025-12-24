import { z } from 'zod';

export const locationSchema = z.object({
  id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  code: z.string().min(1).max(30),
  aisle: z.string().nullable().optional(),
  rack: z.string().nullable().optional(),
  shelf: z.string().nullable().optional(),
  bin: z.string().nullable().optional(),
  zone: z.enum(['receiving', 'storage', 'picking', 'packing', 'shipping', 'quarantine', 'returns']).default('storage'),
  type: z.enum(['floor', 'shelf', 'pallet', 'bulk', 'rack', 'mezzanine']).default('shelf'),
  is_pickable: z.boolean().default(true),
  is_storable: z.boolean().default(true),
  is_active: z.boolean().default(true),
  max_weight_kg: z.number().positive().nullable().optional(),
  max_volume_m3: z.number().positive().nullable().optional(),
  width_cm: z.number().positive().nullable().optional(),
  height_cm: z.number().positive().nullable().optional(),
  depth_cm: z.number().positive().nullable().optional(),
  temperature_controlled: z.boolean().default(false),
  min_temperature: z.number().nullable().optional(),
  max_temperature: z.number().nullable().optional(),
  abc_class: z.enum(['A', 'B', 'C']).nullable().optional(),
  picking_sequence: z.number().int().nonnegative().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const locationCreateSchema = locationSchema.omit({ id: true, created_at: true, updated_at: true });
export const locationUpdateSchema = locationCreateSchema.partial();

export type Location = z.infer<typeof locationSchema>;
export type LocationCreate = z.infer<typeof locationCreateSchema>;
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
