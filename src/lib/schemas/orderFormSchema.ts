import { z } from 'zod';

export const orderItemFormSchema = z.object({
  product_id: z.string().uuid('Selecione um produto'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  unit_price: z.number().nonnegative('Preço inválido'),
  discount: z.number().nonnegative().default(0),
});

export const addressFormSchema = z.object({
  street: z.string().min(1, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  zip_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

export const orderFormSchema = z.object({
  customer_id: z.string().uuid('Selecione um cliente'),
  warehouse_id: z.string().uuid('Selecione um armazém'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  channel: z.enum(['ecommerce', 'marketplace', 'b2b', 'pos', 'manual']),
  shipping_method: z.string().optional(),
  carrier_id: z.string().uuid().optional(),
  shipping_address: addressFormSchema,
  items: z.array(orderItemFormSchema).min(1, 'Adicione pelo menos um item'),
  discount: z.number().nonnegative().default(0),
  shipping_cost: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  promised_date: z.string().datetime().optional(),
});

export type OrderItemForm = z.infer<typeof orderItemFormSchema>;
export type AddressForm = z.infer<typeof addressFormSchema>;
export type OrderForm = z.infer<typeof orderFormSchema>;
