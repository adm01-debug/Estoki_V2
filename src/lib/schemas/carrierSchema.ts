import { z } from 'zod';

export const carrierSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(20),
  name: z.string().min(2),
  cnpj: z.string().regex(/^\d{14}$/).nullable().optional(),
  type: z.enum(['correios', 'transportadora', 'motoboy', 'proprio', 'marketplace']),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  tracking_url: z.string().url().nullable().optional(),
  api_credentials: z.object({
    api_key: z.string().optional(),
    api_secret: z.string().optional(),
    environment: z.enum(['sandbox', 'production']).default('sandbox'),
  }).nullable().optional(),
  delivery_time_days: z.number().int().nonnegative().default(5),
  is_active: z.boolean().default(true),
  supported_services: z.array(z.string()).optional(),
  coverage_states: z.array(z.string().length(2)).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const carrierCreateSchema = carrierSchema.omit({ id: true, created_at: true, updated_at: true });
export type Carrier = z.infer<typeof carrierSchema>;
