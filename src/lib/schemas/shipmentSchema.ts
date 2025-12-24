import { z } from 'zod';

export const shipmentSchema = z.object({
  id: z.string().uuid(),
  shipment_number: z.string(),
  order_id: z.string().uuid(),
  carrier_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  status: z.enum(['pending', 'picked', 'packed', 'labeled', 'dispatched', 'in_transit', 'delivered', 'returned']),
  tracking_code: z.string().nullable().optional(),
  service_type: z.string().nullable().optional(),
  weight_kg: z.number().positive().nullable().optional(),
  volume_m3: z.number().positive().nullable().optional(),
  packages_count: z.number().int().positive().default(1),
  shipping_cost: z.number().nonnegative().default(0),
  insurance_value: z.number().nonnegative().default(0),
  estimated_delivery: z.string().datetime().nullable().optional(),
  shipped_at: z.string().datetime().nullable().optional(),
  delivered_at: z.string().datetime().nullable().optional(),
  proof_of_delivery_url: z.string().url().nullable().optional(),
  recipient_name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const shipmentCreateSchema = shipmentSchema.omit({ id: true, created_at: true, updated_at: true, shipment_number: true });
export type Shipment = z.infer<typeof shipmentSchema>;
