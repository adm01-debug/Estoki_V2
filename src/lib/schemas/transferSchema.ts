import { z } from 'zod';

export const transferItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  lot_id: z.string().uuid().nullable().optional(),
  serial_numbers: z.array(z.string()).optional(),
  source_location_id: z.string().uuid(),
  destination_location_id: z.string().uuid(),
});

export const transferSchema = z.object({
  id: z.string().uuid(),
  transfer_number: z.string(),
  type: z.enum(['internal', 'warehouse', 'location']),
  source_warehouse_id: z.string().uuid(),
  destination_warehouse_id: z.string().uuid(),
  status: z.enum(['draft', 'pending', 'in_transit', 'received', 'completed', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  items: z.array(transferItemSchema).min(1),
  total_items: z.number().int().positive(),
  requested_by: z.string().uuid(),
  approved_by: z.string().uuid().nullable().optional(),
  shipped_by: z.string().uuid().nullable().optional(),
  received_by: z.string().uuid().nullable().optional(),
  requested_date: z.string().datetime(),
  shipped_at: z.string().datetime().nullable().optional(),
  received_at: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const transferCreateSchema = transferSchema.omit({ id: true, created_at: true, updated_at: true, transfer_number: true });
export type Transfer = z.infer<typeof transferSchema>;
