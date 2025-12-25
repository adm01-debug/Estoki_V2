import { z } from 'zod';

export const cycleCountItemSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  productSku: z.string().min(1, 'SKU é obrigatório'),
  productName: z.string().min(1, 'Nome é obrigatório'),
  locationId: z.string().min(1, 'Localização é obrigatória'),
  locationCode: z.string().min(1, 'Código da localização é obrigatório'),
  systemQuantity: z.number().min(0),
  countedQuantity: z.number().min(0, 'Quantidade não pode ser negativa').nullable(),
  variance: z.number().nullable(),
  variancePercentage: z.number().nullable(),
  lotNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  countedBy: z.string().optional(),
  countedAt: z.string().optional(),
  status: z.enum(['pending', 'counted', 'verified', 'adjusted']).default('pending'),
  notes: z.string().optional(),
});

export const cycleCountFormSchema = z.object({
  countName: z.string().min(1, 'Nome da contagem é obrigatório'),
  countType: z.enum(['full', 'abc', 'location', 'product', 'random']).default('full'),
  scheduledDate: z.string().min(1, 'Data é obrigatória'),
  locations: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
  abcClass: z.enum(['A', 'B', 'C']).optional(),
  items: z.array(cycleCountItemSchema).optional(),
  assignedTo: z.array(z.string()).optional(),
  blindCount: z.boolean().default(false),
  requiresRecount: z.boolean().default(false),
  varianceThreshold: z.number().min(0).max(100).default(5),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('draft'),
  notes: z.string().optional(),
});

export type CycleCountItem = z.infer<typeof cycleCountItemSchema>;
export type CycleCountFormData = z.infer<typeof cycleCountFormSchema>;
