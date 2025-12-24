import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1, 'SKU obrigatório').max(50),
  barcode: z.string().nullable().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  brand: z.string().nullable().optional(),
  unit: z.enum(['UN', 'KG', 'L', 'M', 'M2', 'M3', 'CX', 'PC', 'PAR']).default('UN'),
  weight: z.number().positive().nullable().optional(),
  width: z.number().positive().nullable().optional(),
  height: z.number().positive().nullable().optional(),
  depth: z.number().positive().nullable().optional(),
  volume: z.number().positive().nullable().optional(),
  cost_price: z.number().nonnegative().default(0),
  sale_price: z.number().nonnegative().default(0),
  min_stock: z.number().int().nonnegative().default(0),
  max_stock: z.number().int().nonnegative().nullable().optional(),
  reorder_point: z.number().int().nonnegative().default(0),
  lead_time_days: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
  is_serialized: z.boolean().default(false),
  is_lot_controlled: z.boolean().default(false),
  shelf_life_days: z.number().int().nonnegative().nullable().optional(),
  ncm: z.string().regex(/^\d{8}$/, 'NCM deve ter 8 dígitos').nullable().optional(),
  cest: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  supplier_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const productCreateSchema = productSchema.omit({ id: true, created_at: true, updated_at: true });
export const productUpdateSchema = productCreateSchema.partial();

export type Product = z.infer<typeof productSchema>;
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
