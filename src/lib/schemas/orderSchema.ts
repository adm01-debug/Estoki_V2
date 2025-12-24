import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  unit_price: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  picked_quantity: z.number().int().nonnegative().default(0),
  packed_quantity: z.number().int().nonnegative().default(0),
  lot_id: z.string().uuid().nullable().optional(),
  serial_numbers: z.array(z.string()).optional(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  order_number: z.string().min(1),
  external_id: z.string().nullable().optional(),
  customer_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'picking', 'packing', 'shipped', 'delivered', 'cancelled', 'returned']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  channel: z.enum(['ecommerce', 'marketplace', 'b2b', 'pos', 'manual']).default('manual'),
  shipping_method: z.string().nullable().optional(),
  carrier_id: z.string().uuid().nullable().optional(),
  tracking_code: z.string().nullable().optional(),
  shipping_address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    country: z.string().default('BR'),
  }),
  items: z.array(orderItemSchema).min(1, 'Pedido deve ter pelo menos 1 item'),
  subtotal: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  shipping_cost: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  notes: z.string().nullable().optional(),
  promised_date: z.string().datetime().nullable().optional(),
  shipped_at: z.string().datetime().nullable().optional(),
  delivered_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const orderCreateSchema = orderSchema.omit({ id: true, created_at: true, updated_at: true, order_number: true });
export const orderUpdateSchema = orderCreateSchema.partial();

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderCreate = z.infer<typeof orderCreateSchema>;
export type OrderUpdate = z.infer<typeof orderUpdateSchema>;
