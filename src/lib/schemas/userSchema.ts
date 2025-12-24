import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  avatar_url: z.string().url().nullable().optional(),
  role: z.enum(['admin', 'manager', 'operator', 'viewer']),
  warehouse_id: z.string().uuid().nullable().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido').nullable().optional(),
  is_active: z.boolean().default(true),
  last_login: z.string().datetime().nullable().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(['pt-BR', 'en-US', 'es']).default('pt-BR'),
    notifications: z.boolean().default(true),
  }).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const userCreateSchema = userSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true,
  last_login: true 
});

export const userUpdateSchema = userCreateSchema.partial();

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
