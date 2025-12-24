import { z } from 'zod';

export const receivingItemFormSchema = z.object({
  product_id: z.string().uuid('Selecione um produto'),
  expected_quantity: z.number().int().positive('Quantidade deve ser positiva'),
  unit_cost: z.number().nonnegative('Custo inválido'),
  lot_number: z.string().optional(),
  expiration_date: z.string().optional(),
});

export const receivingFormSchema = z.object({
  supplier_id: z.string().uuid('Selecione um fornecedor'),
  warehouse_id: z.string().uuid('Selecione um armazém'),
  purchase_order_id: z.string().uuid().optional(),
  invoice_number: z.string().optional(),
  invoice_key: z.string().length(44).optional().or(z.literal('')),
  expected_date: z.string().optional(),
  items: z.array(receivingItemFormSchema).min(1, 'Adicione pelo menos um item'),
  notes: z.string().optional(),
});

export const receivingConfirmFormSchema = z.object({
  item_id: z.string().uuid(),
  received_quantity: z.number().int().nonnegative(),
  damaged_quantity: z.number().int().nonnegative().default(0),
  location_id: z.string().uuid('Selecione uma localização'),
  lot_number: z.string().optional(),
  expiration_date: z.string().optional(),
  serial_numbers: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type ReceivingItemForm = z.infer<typeof receivingItemFormSchema>;
export type ReceivingForm = z.infer<typeof receivingFormSchema>;
export type ReceivingConfirmForm = z.infer<typeof receivingConfirmFormSchema>;
