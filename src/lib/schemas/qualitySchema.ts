import { z } from 'zod';

export const qualityInspectionSchema = z.object({
  id: z.string().uuid(),
  inspection_number: z.string(),
  type: z.enum(['receiving', 'in_process', 'final', 'return']),
  reference_type: z.enum(['receiving', 'order', 'lot', 'product']),
  reference_id: z.string().uuid(),
  product_id: z.string().uuid(),
  lot_id: z.string().uuid().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'passed', 'failed', 'conditional']),
  inspected_quantity: z.number().int().positive(),
  passed_quantity: z.number().int().nonnegative().default(0),
  failed_quantity: z.number().int().nonnegative().default(0),
  defects: z.array(z.object({
    type: z.string(),
    quantity: z.number().int().positive(),
    severity: z.enum(['minor', 'major', 'critical']),
    description: z.string().nullable().optional(),
  })).default([]),
  inspector_id: z.string().uuid(),
  inspected_at: z.string().datetime(),
  notes: z.string().nullable().optional(),
  photos: z.array(z.string().url()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const qualityCreateSchema = qualityInspectionSchema.omit({ id: true, created_at: true, updated_at: true, inspection_number: true });
export type QualityInspection = z.infer<typeof qualityInspectionSchema>;
