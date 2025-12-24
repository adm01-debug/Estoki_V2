import { z } from 'zod';

export const profileFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export const passwordChangeFormSchema = z.object({
  current_password: z.string().min(1, 'Senha atual obrigatória'),
  new_password: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'As senhas não conferem',
  path: ['confirm_password'],
});

export const preferencesFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['pt-BR', 'en-US', 'es']),
  notifications_enabled: z.boolean(),
  email_notifications: z.boolean(),
  sound_enabled: z.boolean(),
  default_warehouse_id: z.string().uuid().optional(),
});

export const companySettingsFormSchema = z.object({
  company_name: z.string().min(2),
  trade_name: z.string().optional(),
  cnpj: z.string().regex(/^\d{14}$/),
  ie: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip_code: z.string(),
  }),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;
export type PasswordChangeForm = z.infer<typeof passwordChangeFormSchema>;
export type PreferencesForm = z.infer<typeof preferencesFormSchema>;
export type CompanySettingsForm = z.infer<typeof companySettingsFormSchema>;
