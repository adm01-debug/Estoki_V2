import { z } from 'zod';

export const pickingItemSchema = z.object({
  id: z.string().uuid(),
  order_item_id: z.string().uuid(),
  product_id: z.string().uuid(),
  location_id: z.string().uuid(),
  quantity_to_pick: z.number().int().positive(),
  quantity_picked: z.number().int().nonnegative().default(0),
  lot_id: z.string().uuid().nullable().optional(),
  serial_numbers: z.array(z.string()).optional(),
  picked_at: z.string().datetime().nullable().optional(),
  picked_by: z.string().uuid().nullable().optional(),
});

export const pickingSchema = z.object({
  id: z.string().uuid(),
  picking_number: z.string(),
  wave_id: z.string().uuid().nullable().optional(),
  order_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  assigned_to: z.string().uuid().nullable().optional(),
  items: z.array(pickingItemSchema).min(1),
  total_items: z.number().int().positive(),
  picked_items: z.number().int().nonnegative().default(0),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  route_sequence: z.array(z.string().uuid()).optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const pickingCreateSchema = pickingSchema.omit({ id: true, created_at: true, updated_at: true, picking_number: true });
export type Picking = z.infer<typeof pickingSchema>;
