import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

export const signupSchema = z.object({
  nome: z.string().trim().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }).max(100),
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .regex(/[A-Z]/, { message: "Deve conter ao menos uma letra maiúscula" })
    .regex(/[a-z]/, { message: "Deve conter ao menos uma letra minúscula" })
    .regex(/[0-9]/, { message: "Deve conter ao menos um número" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Deve conter ao menos um caractere especial" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
