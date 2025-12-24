import { z } from 'zod';

export const customerSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(20),
  type: z.enum(['pf', 'pj']),
  name: z.string().min(2),
  document: z.string(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
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
  credit_limit: z.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const customerCreateSchema = customerSchema.omit({ id: true, created_at: true, updated_at: true });
export type Customer = z.infer<typeof customerSchema>;
