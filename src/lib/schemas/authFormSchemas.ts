import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  remember: z.boolean().default(false),
});

export const registerFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export const forgotPasswordFormSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordFormSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;
