import { z } from 'zod';

export const serialSchema = z.object({
  id: z.string().uuid(),
  serial_number: z.string().min(1),
  product_id: z.string().uuid(),
  lot_id: z.string().uuid().nullable().optional(),
  status: z.enum(['available', 'reserved', 'sold', 'returned', 'damaged', 'scrapped']),
  warehouse_id: z.string().uuid().nullable().optional(),
  location_id: z.string().uuid().nullable().optional(),
  receiving_id: z.string().uuid().nullable().optional(),
  order_id: z.string().uuid().nullable().optional(),
  warranty_expiration: z.string().datetime().nullable().optional(),
  manufacturing_date: z.string().datetime().nullable().optional(),
  last_movement_at: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const serialCreateSchema = serialSchema.omit({ id: true, created_at: true, updated_at: true });
export type Serial = z.infer<typeof serialSchema>;
