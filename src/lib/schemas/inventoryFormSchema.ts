import { z } from 'zod';

export const inventoryAdjustmentItemSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  productSku: z.string().min(1, 'SKU é obrigatório'),
  locationId: z.string().min(1, 'Localização é obrigatória'),
  currentQuantity: z.number().min(0),
  newQuantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  adjustmentQuantity: z.number(),
  lotNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
});

export const inventoryFormSchema = z.object({
  adjustmentType: z.enum(['add', 'remove', 'transfer', 'correction', 'damage', 'expiry']),
  items: z.array(inventoryAdjustmentItemSchema).min(1, 'Pelo menos um item é obrigatório'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  requiresApproval: z.boolean().default(false),
});

export const inventoryTransferFormSchema = z.object({
  sourceLocationId: z.string().min(1, 'Localização de origem é obrigatória'),
  destinationLocationId: z.string().min(1, 'Localização de destino é obrigatória'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    lotNumber: z.string().optional(),
    serialNumber: z.string().optional(),
  })).min(1, 'Pelo menos um item é obrigatório'),
  reason: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

export type InventoryAdjustmentItem = z.infer<typeof inventoryAdjustmentItemSchema>;
export type InventoryFormData = z.infer<typeof inventoryFormSchema>;
export type InventoryTransferFormData = z.infer<typeof inventoryTransferFormSchema>;
