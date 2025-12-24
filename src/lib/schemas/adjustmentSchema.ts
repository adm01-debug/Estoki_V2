import { z } from 'zod';

export const adjustmentSchema = z.object({
  id: z.string().uuid(),
  adjustment_number: z.string(),
  warehouse_id: z.string().uuid(),
  type: z.enum(['increase', 'decrease']),
  reason: z.enum(['count', 'damage', 'expiration', 'theft', 'return', 'correction', 'write_off', 'found', 'other']),
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'completed']),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    location_id: z.string().uuid(),
    lot_id: z.string().uuid().nullable().optional(),
    quantity: z.number().int(),
    unit_cost: z.number().nonnegative(),
    serial_numbers: z.array(z.string()).optional(),
  })).min(1),
  total_items: z.number().int().positive(),
  total_value: z.number(),
  reference_document: z.string().nullable().optional(),
  requested_by: z.string().uuid(),
  approved_by: z.string().uuid().nullable().optional(),
  approved_at: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const adjustmentCreateSchema = adjustmentSchema.omit({ id: true, created_at: true, updated_at: true, adjustment_number: true });
export type Adjustment = z.infer<typeof adjustmentSchema>;
