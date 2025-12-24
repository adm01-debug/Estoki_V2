import { z } from 'zod';

export const lotSchema = z.object({
  id: z.string().uuid(),
  lot_number: z.string().min(1),
  product_id: z.string().uuid(),
  supplier_id: z.string().uuid().nullable().optional(),
  manufacturing_date: z.string().datetime().nullable().optional(),
  expiration_date: z.string().datetime().nullable().optional(),
  receiving_id: z.string().uuid().nullable().optional(),
  initial_quantity: z.number().int().positive(),
  current_quantity: z.number().int().nonnegative(),
  unit_cost: z.number().nonnegative(),
  status: z.enum(['active', 'quarantine', 'expired', 'depleted', 'recalled']),
  certificate_url: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const lotCreateSchema = lotSchema.omit({ id: true, created_at: true, updated_at: true });
export type Lot = z.infer<typeof lotSchema>;
