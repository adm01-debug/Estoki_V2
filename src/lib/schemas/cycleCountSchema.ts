import { z } from 'zod';

export const cycleCountItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  location_id: z.string().uuid(),
  system_quantity: z.number().int().nonnegative(),
  counted_quantity: z.number().int().nonnegative().nullable(),
  variance: z.number().int().nullable(),
  variance_value: z.number().nullable(),
  status: z.enum(['pending', 'counted', 'recounted', 'approved', 'adjusted']),
  counted_by: z.string().uuid().nullable().optional(),
  counted_at: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const cycleCountSchema = z.object({
  id: z.string().uuid(),
  count_number: z.string(),
  warehouse_id: z.string().uuid(),
  type: z.enum(['full', 'partial', 'abc', 'random', 'location']),
  status: z.enum(['planned', 'in_progress', 'review', 'completed', 'cancelled']),
  scheduled_date: z.string().datetime(),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  items: z.array(cycleCountItemSchema),
  total_items: z.number().int().nonnegative(),
  counted_items: z.number().int().nonnegative().default(0),
  variance_items: z.number().int().nonnegative().default(0),
  total_variance_value: z.number().default(0),
  assigned_to: z.array(z.string().uuid()).default([]),
  approved_by: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const cycleCountCreateSchema = cycleCountSchema.omit({ id: true, created_at: true, updated_at: true, count_number: true });
export type CycleCount = z.infer<typeof cycleCountSchema>;
