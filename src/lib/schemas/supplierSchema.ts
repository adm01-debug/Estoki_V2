import { z } from 'zod';

export const supplierSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(20),
  company_name: z.string().min(2),
  trade_name: z.string().nullable().optional(),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
  ie: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip_code: z.string(),
    country: z.string().default('BR'),
  }).nullable().optional(),
  payment_terms: z.number().int().nonnegative().default(30),
  lead_time_days: z.number().int().nonnegative().default(7),
  min_order_value: z.number().nonnegative().default(0),
  rating: z.number().min(0).max(5).nullable().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const supplierCreateSchema = supplierSchema.omit({ id: true, created_at: true, updated_at: true });
export type Supplier = z.infer<typeof supplierSchema>;
