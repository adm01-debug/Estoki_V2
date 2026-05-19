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

export const InventoryReserveSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade: z.number().positive(),
  pedido_id: z.string().uuid().optional(),
  prioridade: z.enum(["baixa", "media", "alta"]).optional().default("media"),
});

// ── Shipping schemas ──────────────────────────────────────
export const ShippingQuoteSchema = z.object({
  carrier: z.enum(["correios", "jadlog", "azul", "fedex", "dhl"]),
  originZip: z.string().regex(/^\d{8}$/, "CEP de origem inválido (8 dígitos)"),
  destZip: z.string().regex(/^\d{8}$/, "CEP de destino inválido (8 dígitos)"),
  weight: z.number().positive("Peso deve ser maior que zero"),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    length: z.number().positive(),
  }).optional(),
});

export const CarrierQuoteRequestSchema = z.object({
  origin_cep: z.string().regex(/^\d{8}$/, "CEP de origem inválido"),
  destination_cep: z.string().regex(/^\d{8}$/, "CEP de destino inválido"),
  weight: z.number().positive(),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    length: z.number().positive(),
  }),
  carriers: z.array(z.string()).optional().default(["correios", "jadlog", "azul"]),
});

export const CreateShipmentSchema = z.object({
  orderId: z.string().uuid("ID do pedido inválido"),
  carrier: z.string().min(1, "Transportadora é obrigatória"),
  trackingNumber: z.string().min(1, "Número de rastreio é obrigatório"),
});

// ── Picking schemas ──────────────────────────────────────
export const PickingConfirmSchema = z.object({
  pick_list_id: z.string().uuid("ID do Pick List inválido"),
  picker_id: z.string().uuid("ID do Separador inválido"),
  items: z.array(z.object({
    pick_item_id: z.string().uuid("ID do Item de Pick inválido"),
    picked_quantity: z.number().min(0, "Quantidade não pode ser negativa"),
    location_id: z.string().uuid().optional(),
    lot_number: z.string().optional(),
  })).min(1, "É necessário ao menos um item"),
});

export const CarrierTrackSchema = z.object({
  tracking_number: z.string().min(1, "Número de rastreio é obrigatório"),
  carrier: z.string().optional().default("auto"),
});

export const WebhookEventSchema = z.object({
  event: z.string().min(1).max(200),
  data: z.record(z.unknown()).optional().default({}),
});

// ── AI schemas ─────────────────────────────────────────────
export const AiClassificationSchema = z.object({
  text: z.string().min(1, "Texto é obrigatório").max(10000),
  categories: z.array(z.string()).min(1, "Ao menos uma categoria é obrigatória"),
  model: z.enum(["simple", "advanced"]).optional().default("simple"),
});

export const InventoryTransferSchema = z.object({
  produto_id: z.string().uuid("ID do produto inválido"),
  origem_id: z.string().uuid("ID da posição de origem inválido"),
  destino_id: z.string().uuid("ID da posição de destino inválido"),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
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
