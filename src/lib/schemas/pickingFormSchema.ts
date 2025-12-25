import { z } from 'zod';

export const pickingItemSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  productSku: z.string().min(1, 'SKU é obrigatório'),
  productName: z.string().min(1, 'Nome do produto é obrigatório'),
  quantityRequested: z.number().min(1, 'Quantidade deve ser maior que 0'),
  quantityPicked: z.number().min(0, 'Quantidade não pode ser negativa'),
  locationId: z.string().min(1, 'Localização é obrigatória'),
  locationCode: z.string().min(1, 'Código da localização é obrigatório'),
  lotNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  notes: z.string().optional(),
});

export const pickingFormSchema = z.object({
  orderId: z.string().min(1, 'Pedido é obrigatório'),
  orderNumber: z.string().min(1, 'Número do pedido é obrigatório'),
  waveId: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  assignedTo: z.string().optional(),
  items: z.array(pickingItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export const pickingBatchFormSchema = z.object({
  pickingIds: z.array(z.string()).min(1, 'Selecione pelo menos uma coleta'),
  batchName: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

export type PickingItem = z.infer<typeof pickingItemSchema>;
export type PickingFormData = z.infer<typeof pickingFormSchema>;
export type PickingBatchFormData = z.infer<typeof pickingBatchFormSchema>;
