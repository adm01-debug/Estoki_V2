import { z } from 'zod';

export const waveOrderSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  itemCount: z.number().min(1),
  totalQuantity: z.number().min(1),
  estimatedTime: z.number().optional(),
});

export const waveFormSchema = z.object({
  waveName: z.string().min(1, 'Nome da wave é obrigatório'),
  waveType: z.enum(['manual', 'automatic', 'scheduled']).default('manual'),
  orders: z.array(waveOrderSchema).min(1, 'Selecione pelo menos um pedido'),
  assignedTo: z.array(z.string()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  scheduledStart: z.string().optional(),
  deadline: z.string().optional(),
  zoneRestrictions: z.array(z.string()).optional(),
  maxOrders: z.number().min(1).optional(),
  maxItems: z.number().min(1).optional(),
  pickingStrategy: z.enum(['fifo', 'fefo', 'lifo', 'zone', 'batch']).default('fifo'),
  notes: z.string().optional(),
  status: z.enum(['draft', 'planned', 'released', 'in_progress', 'completed', 'cancelled']).default('draft'),
});

export const waveOptimizationSchema = z.object({
  waveId: z.string().min(1),
  optimizationType: z.enum(['route', 'zone', 'picker', 'time']),
  constraints: z.object({
    maxDistance: z.number().optional(),
    maxTime: z.number().optional(),
    balanceWorkload: z.boolean().default(true),
  }).optional(),
});

export type WaveOrder = z.infer<typeof waveOrderSchema>;
export type WaveFormData = z.infer<typeof waveFormSchema>;
export type WaveOptimizationData = z.infer<typeof waveOptimizationSchema>;
