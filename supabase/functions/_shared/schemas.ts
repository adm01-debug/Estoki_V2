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

export const VerifyEmailSchema = z.object({
  token: z.string().min(10).max(2048),
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(10).max(4096),
});

export const TwoFactorSetupSchema = z.object({
  action: z.enum(["enroll", "unenroll", "list"]),
  factorId: z.string().min(1).optional(),
});

export const TwoFactorVerifySchema = z.object({
  factorId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "Código deve ter 6 dígitos"),
  action: z.enum(["verify-enrollment", "verify-login", "challenge"]).optional(),
  challengeId: z.string().optional(),
});

export const ChangePasswordOnlySchema = z.object({
  newPassword: z.string().min(8).max(128),
});

export const BoletoGenerateSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  due_date: z.string().min(8).max(40),
  payer: z.object({
    name: z.string().min(2).max(200),
    document: z.string().min(11).max(20),
    address: z.string().max(500).optional(),
  }),
  description: z.string().min(1).max(500),
  instructions: z.array(z.string().max(200)).max(20).optional(),
});

// ── NF-e schemas ──────────────────────────────────────────
export const NfeImportSchema = z
  .object({
    xml_content: z.string().min(1).max(5_000_000).optional(),
    access_key: z
      .string()
      .min(44)
      .max(44)
      .regex(/^\d{44}$/, "Chave de acesso deve ter 44 dígitos")
      .optional(),
  })
  .refine((d) => d.xml_content || d.access_key, {
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
  dimensions: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
      length: z.number().positive(),
    })
    .optional(),
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
  items: z
    .array(
      z.object({
        pick_item_id: z.string().uuid("ID do Item de Pick inválido"),
        picked_quantity: z.number().min(0, "Quantidade não pode ser negativa"),
        location_id: z.string().uuid().optional(),
        lot_number: z.string().optional(),
      })
    )
    .min(1, "É necessário ao menos um item"),
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

export const PixGenerateSchema = z.object({
  amount: z.number().positive("amount deve ser maior que zero").max(1_000_000),
  description: z.string().max(140).optional(),
  payer_name: z.string().max(120).optional(),
  expiration_minutes: z.number().int().min(1).max(1440).optional(),
});

export const CreateSalesOrderSchema = z.object({
  customerId: z.string().uuid("customerId inválido"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid().optional(),
        sku: z.string().min(1).max(64).optional(),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1, "Ao menos um item é obrigatório")
    .max(500),
  shippingAddress: z.record(z.unknown()).optional(),
  notes: z.string().max(2000).optional(),
});

export const CancelOrderSchema = z.object({
  orderId: z.string().uuid("orderId inválido"),
  reason: z.string().min(1).max(500),
  userId: z.string().uuid().optional(),
});

export const CarrierBookSchema = z.object({
  order_id: z.string().uuid().optional(),
  shipment_id: z.string().uuid().optional(),
  carrier: z.string().min(1).max(64),
  service: z.string().max(64).optional(),
  weight_kg: z.number().positive().max(1000).optional(),
  destination_zip: z.string().min(3).max(16).optional(),
});

// ── Bulk / Batch operation schemas ────────────────────────
// Whitelist rigorosa: apenas tabelas operacionais podem ser alvo dos
// endpoints `bulk-*` (executam com service_role e ignoram RLS).
export const BulkTableEnum = z.enum([
  "lotes",
  "tarefas",
  "notificacoes",
  "alertas_historico",
  "produtos",
  "produtos_precos",
  "posicoes_estoque",
  "estoque_posicao",
  "ondas_separacao",
  "eventos_picking",
  "eventos_triagem",
  "romaneios",
  "romaneio_itens",
  "orders",
  "order_items",
  "rastreamento_historico",
  "inspecoes_qualidade",
  "saved_filters",
  "metricas_dashboard",
  "metricas_operacionais",
]);

export const BulkDeleteSchema = z.object({
  table: BulkTableEnum,
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const BulkInsertSchema = z.object({
  table: BulkTableEnum,
  records: z.array(z.record(z.unknown())).min(1).max(500),
});

export const BulkUpdateSchema = z.object({
  table: BulkTableEnum,
  records: z.array(z.record(z.unknown())).min(1).max(500),
  matchColumns: z.array(z.string().min(1).max(64)).min(1).max(5),
});

export const BulkUpsertSchema = z.object({
  table: BulkTableEnum,
  records: z.array(z.record(z.unknown())).min(1).max(500),
  conflictColumns: z.array(z.string().min(1).max(64)).min(1).max(5),
});

export const BatchProcessorSchema = z
  .object({
    action: z.string().min(1).max(64).optional(),
    payload: z.record(z.unknown()).optional(),
  })
  .passthrough();

export const BatchImportSchema = z.object({
  type: z.enum(["products", "receiving", "locations", "stock_adjustment"]),
  data: z.union([z.array(z.record(z.unknown())).max(5000), z.record(z.unknown())]),
  options: z
    .object({
      skip_errors: z.boolean().optional(),
      update_existing: z.boolean().optional(),
      batch_size: z.number().int().min(1).max(1000).optional(),
    })
    .optional(),
});

// ── Alert schemas ─────────────────────────────────────────
export const AlertStockLowSchema = z.object({
  warehouse_id: z.string().uuid().optional(),
});

export const AlertExpirationSchema = z.object({
  days_threshold: z.number().int().min(1).max(365).optional().default(30),
});

// ── Lote Zod: alerts + audit + analytics + cache ─────────
export const AlertMonitorSchema = z.object({
  tipo: z.string().min(1).max(64).optional(),
  severidade: z.enum(["info", "warning", "high", "critical"]).optional(),
  limite: z.number().int().min(1).max(1000).optional(),
}).passthrough();

export const AlertPendingOrdersSchema = z.object({
  hours_threshold: z.number().int().min(1).max(720).optional().default(24),
});

export const AlertProductivitySchema = z.object({
  user_id: z.string().uuid().optional(),
  periodo: z.enum(["dia", "semana", "mes"]).optional(),
}).passthrough();

export const AlertQualitySchema = z.object({
  taxa_minima: z.number().min(0).max(100).optional(),
}).passthrough();

export const AlertSlaBreachSchema = z.object({
  sla_horas: z.number().int().min(1).max(720).optional(),
}).passthrough();

export const AuditLogSchema = z.object({
  action: z.enum(["log", "query"]),
  data: z.record(z.unknown()),
});

export const AnalyticsEventSchema = z.object({
  event: z.string().min(1).max(200),
  properties: z.record(z.unknown()).optional(),
  user_id: z.string().uuid().optional(),
  session_id: z.string().max(200).optional(),
});

export const CacheSchema = z.object({
  action: z.enum(["get", "set", "delete"]),
  key: z.string().min(1).max(500),
  value: z.unknown().optional(),
  ttl: z.number().int().min(1).max(86400).optional(),
});

export const CacheInvalidateSchema = z.object({
  pattern: z.string().min(1).max(500).optional(),
  keys: z.array(z.string().min(1).max(500)).max(1000).optional(),
}).refine((d) => d.pattern || (d.keys && d.keys.length > 0), {
  message: "pattern ou keys[] é obrigatório",
});

// ── AI schemas ────────────────────────────────────────────
export const AiAssistantSchema = z.object({
  message: z.string().min(1).max(8000),
  context: z.unknown().optional(),
});

export const AiClassifySchema = z.object({
  text: z.string().min(1).max(8000),
  categories: z.array(z.string().min(1).max(100)).min(1).max(50),
});

export const AiCompletionSchema = z.object({
  prompt: z.string().min(1).max(16000),
  model: z.string().min(1).max(100).optional(),
  maxTokens: z.number().int().min(1).max(4000).optional(),
});

export const AiEmbeddingSchema = z.object({
  text: z.string().min(1).max(16000),
  model: z.string().min(1).max(100).optional(),
});

export const AiSentimentSchema = z.object({
  text: z.string().min(1).max(8000),
  language: z.string().min(2).max(10).optional(),
});

export const AiSummarizeSchema = z.object({
  text: z.string().min(1).max(16000),
  maxLength: z.number().int().min(10).max(2000).optional(),
});

export const AiTranslateSchema = z.object({
  text: z.string().min(1).max(16000),
  targetLang: z.string().min(2).max(20).optional(),
});

// ── Carrier / Cleanup schemas ─────────────────────────────
const zipRegex = /^\d{5}-?\d{3}$/;

export const CarrierQuoteSchema = z.object({
  origin_zip: z.string().regex(zipRegex, "CEP de origem inválido"),
  destination_zip: z.string().regex(zipRegex, "CEP de destino inválido"),
  weight: z.number().positive().max(1000),
  length: z.number().positive().max(500).optional(),
  width: z.number().positive().max(500).optional(),
  height: z.number().positive().max(500).optional(),
  value: z.number().nonnegative().max(1_000_000).optional(),
  services: z.array(z.string().min(1).max(40)).max(20).optional(),
});

export const CarrierCancelSchema = z.object({
  shipment_id: z.string().uuid().optional(),
  tracking_code: z.string().min(3).max(60).optional(),
  reason: z.string().min(1).max(500).optional(),
}).refine((v) => v.shipment_id || v.tracking_code, {
  message: "shipment_id ou tracking_code é obrigatório",
});

export const CarrierLabelSchema = z.object({
  shipment_id: z.string().uuid(),
  carrier: z.string().min(2).max(40),
  sender: z.record(z.any()),
  recipient: z.record(z.any()),
  packages: z.array(z.record(z.any())).min(1).max(100),
});

export const CarrierRatesCacheSchema = z.object({
  action: z.enum(["get", "set", "invalidate"]).default("get"),
  key: z.string().min(1).max(200).optional(),
  value: z.unknown().optional(),
  ttlSeconds: z.number().int().min(1).max(86400 * 30).optional(),
});

export const CarrierWebhookSchema = z.object({
  carrier: z.string().min(2).max(40),
  event: z.string().min(1).max(80),
  tracking_code: z.string().min(3).max(80).optional(),
  status: z.string().max(80).optional(),
  occurred_at: z.string().max(60).optional(),
  payload: z.record(z.any()).optional(),
});

export const CleanupOldDataSchema = z.object({
  days: z.number().int().min(1).max(3650).default(90),
});

export const CleanupSessionsSchema = z.object({
  max_age_hours: z.number().int().min(1).max(24 * 365).default(24),
  dry_run: z.boolean().default(false),
});

// ── Helper: validate and return typed result ──────────────

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; error: string; details: Record<string, string[]> } {
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
