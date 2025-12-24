import { z } from 'zod';

export const inventorySchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  location_id: z.string().uuid(),
  lot_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().nonnegative(),
  reserved_quantity: z.number().int().nonnegative().default(0),
  available_quantity: z.number().int().nonnegative(),
  unit_cost: z.number().nonnegative().default(0),
  total_cost: z.number().nonnegative().default(0),
  last_count_date: z.string().datetime().nullable().optional(),
  last_movement_date: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const inventoryAdjustSchema = z.object({
  product_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  location_id: z.string().uuid(),
  adjustment_type: z.enum(['increase', 'decrease', 'set']),
  quantity: z.number().int(),
  reason: z.enum(['count', 'damage', 'expiration', 'return', 'correction', 'other']),
  notes: z.string().nullable().optional(),
});

export type Inventory = z.infer<typeof inventorySchema>;
export type InventoryAdjust = z.infer<typeof inventoryAdjustSchema>;
