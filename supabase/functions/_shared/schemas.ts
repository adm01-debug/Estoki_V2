/**
 * Shared Zod schemas for Edge Function input validation
 */
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ── Auth schemas ──────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(128),
});

export const RegisterSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres").max(128),
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(200).optional(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

// ── NF-e schemas ──────────────────────────────────────────
export const NfeImportSchema = z.object({
  xml_content: z.string().min(1).max(5_000_000).optional(),
  access_key: z.string().min(44).max(44).regex(/^\d{44}$/, "Chave de acesso deve ter 44 dígitos").optional(),
}).refine(d => d.xml_content || d.access_key, {
  message: "xml_content ou access_key é obrigatório",
});

// ── Generic operation schemas ─────────────────────────────
export const IdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const DateRangeSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// ── Inventory schemas ─────────────────────────────────────
export const StockMovementSchema = z.object({
  produto_id: z.string().uuid(),
  posicao_origem_id: z.string().uuid().optional(),
  posicao_destino_id: z.string().uuid().optional(),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
  tipo: z.enum(["entrada", "saida", "transferencia", "ajuste"]),
  lote_id: z.string().uuid().optional(),
  motivo: z.string().max(500).optional(),
});

export const InventoryAdjustSchema = z.object({
  produto_id: z.string().uuid(),
  posicao_id: z.string().uuid(),
  quantidade_nova: z.number().min(0),
  motivo: z.string().min(3, "Motivo obrigatório").max(500),
  lote_id: z.string().uuid().optional(),
});

// ── Helper: validate and return typed result ──────────────
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; error: string; details: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: "Validation failed",
    details: result.error.flatten().fieldErrors as Record<string, string[]>,
  };
}
