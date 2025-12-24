import { z } from 'zod';

export const waveSchema = z.object({
  id: z.string().uuid(),
  wave_number: z.string(),
  warehouse_id: z.string().uuid(),
  status: z.enum(['planning', 'ready', 'released', 'in_progress', 'completed', 'cancelled']),
  type: z.enum(['single', 'batch', 'cluster', 'zone']).default('batch'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  order_ids: z.array(z.string().uuid()).min(1),
  total_orders: z.number().int().positive(),
  total_items: z.number().int().positive(),
  total_lines: z.number().int().positive(),
  completed_orders: z.number().int().nonnegative().default(0),
  assigned_pickers: z.array(z.string().uuid()).default([]),
  planned_start: z.string().datetime().nullable().optional(),
  released_at: z.string().datetime().nullable().optional(),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  cutoff_time: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const waveCreateSchema = waveSchema.omit({ id: true, created_at: true, updated_at: true, wave_number: true });
export type Wave = z.infer<typeof waveSchema>;
