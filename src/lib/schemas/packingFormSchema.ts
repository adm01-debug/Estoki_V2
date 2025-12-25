import { z } from 'zod';

export const packingItemSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  productSku: z.string().min(1, 'SKU é obrigatório'),
  productName: z.string().min(1, 'Nome é obrigatório'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
  }).optional(),
  lotNumber: z.string().optional(),
  serialNumber: z.string().optional(),
});

export const packageSchema = z.object({
  packageNumber: z.string().min(1, 'Número do pacote é obrigatório'),
  packageType: z.enum(['box', 'envelope', 'pallet', 'custom']),
  weight: z.number().min(0, 'Peso não pode ser negativo'),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }),
  items: z.array(packingItemSchema),
  trackingNumber: z.string().optional(),
  labelPrinted: z.boolean().default(false),
});

export const packingFormSchema = z.object({
  orderId: z.string().min(1, 'Pedido é obrigatório'),
  orderNumber: z.string().min(1, 'Número do pedido é obrigatório'),
  pickingId: z.string().optional(),
  packages: z.array(packageSchema).min(1, 'Pelo menos um pacote é obrigatório'),
  totalWeight: z.number().min(0),
  carrierId: z.string().optional(),
  shippingMethod: z.string().optional(),
  specialInstructions: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'shipped']).default('pending'),
  packedBy: z.string().optional(),
  packedAt: z.string().optional(),
});

export type PackingItem = z.infer<typeof packingItemSchema>;
export type Package = z.infer<typeof packageSchema>;
export type PackingFormData = z.infer<typeof packingFormSchema>;
