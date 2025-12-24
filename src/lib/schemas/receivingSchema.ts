import { z } from 'zod';

export const receivingItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  expected_quantity: z.number().int().positive(),
  received_quantity: z.number().int().nonnegative().default(0),
  damaged_quantity: z.number().int().nonnegative().default(0),
  unit_cost: z.number().nonnegative(),
  lot_number: z.string().nullable().optional(),
  expiration_date: z.string().datetime().nullable().optional(),
  location_id: z.string().uuid().nullable().optional(),
  serial_numbers: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export const receivingSchema = z.object({
  id: z.string().uuid(),
  receiving_number: z.string(),
  supplier_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  purchase_order_id: z.string().uuid().nullable().optional(),
  invoice_number: z.string().nullable().optional(),
  invoice_key: z.string().length(44).nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'inspection', 'putaway', 'completed', 'cancelled']),
  expected_date: z.string().datetime().nullable().optional(),
  received_at: z.string().datetime().nullable().optional(),
  items: z.array(receivingItemSchema).min(1),
  total_items: z.number().int().nonnegative(),
  total_value: z.number().nonnegative(),
  received_by: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const receivingCreateSchema = receivingSchema.omit({ id: true, created_at: true, updated_at: true, receiving_number: true });
export type Receiving = z.infer<typeof receivingSchema>;
