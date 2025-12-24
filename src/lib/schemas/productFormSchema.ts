import { z } from 'zod';

export const productFormSchema = z.object({
  sku: z.string().min(1, 'SKU obrigatório').max(50, 'SKU muito longo'),
  barcode: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  brand: z.string().optional(),
  unit: z.enum(['UN', 'KG', 'L', 'M', 'M2', 'M3', 'CX', 'PC', 'PAR']),
  weight: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  cost_price: z.number().nonnegative(),
  sale_price: z.number().nonnegative(),
  min_stock: z.number().int().nonnegative(),
  max_stock: z.number().int().nonnegative().optional(),
  reorder_point: z.number().int().nonnegative(),
  lead_time_days: z.number().int().nonnegative(),
  is_active: z.boolean(),
  is_serialized: z.boolean(),
  is_lot_controlled: z.boolean(),
  shelf_life_days: z.number().int().nonnegative().optional(),
  ncm: z.string().regex(/^\d{8}$/, 'NCM deve ter 8 dígitos').optional().or(z.literal('')),
  supplier_id: z.string().uuid().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export type ProductForm = z.infer<typeof productFormSchema>;
