import { z } from "zod";

// ── Shared validation messages (PT-BR) ──
const msg = {
  required: "Campo obrigatório",
  min: (n: number) => `Mínimo ${n} caracteres`,
  max: (n: number) => `Máximo ${n} caracteres`,
  positive: "Deve ser maior que 0",
  nonNegative: "Não pode ser negativo",
  invalidEmail: "E-mail inválido",
  invalidSku: "SKU inválido (use letras, números e hífens)",
  invalidPlaca: "Placa inválida",
  minGreaterThanMax: "Estoque mínimo não pode ser maior que o máximo",
};

// ── Movimentação ──
export const movimentacaoSchema = z.object({
  tipo: z.enum(["armazenamento", "separacao", "saida_transporte", "devolucao", "ajuste_estoque"], {
    required_error: "Selecione o tipo de movimentação",
  }),
  localizacao: z.string().trim().max(50, msg.max(50)).optional(),
  quantidade: z.number({ required_error: msg.required }).int().min(1, msg.positive),
  descricao: z.string().trim().min(3, msg.min(3)).max(500, msg.max(500)),
});

export type MovimentacaoFormData = z.infer<typeof movimentacaoSchema>;

// ── Produto ──
export const produtoSchema = z.object({
  sku: z.string().trim().min(1, msg.required).max(50, msg.max(50))
    .regex(/^[A-Za-z0-9\-_.]+$/, msg.invalidSku),
  nome: z.string().trim().min(2, msg.min(2)).max(200, msg.max(200)),
  descricao: z.string().trim().max(500, msg.max(500)).optional().or(z.literal("")),
  unidade: z.string().min(1, msg.required),
  estoque_minimo: z.number().int().min(0, msg.nonNegative),
  estoque_maximo: z.number().int().min(0, msg.nonNegative),
  ponto_pedido: z.number().int().min(0, msg.nonNegative),
  peso_unitario: z.number().min(0, msg.nonNegative).optional().or(z.literal(0)),
  fornecedor_principal: z.string().trim().max(200, msg.max(200)).optional().or(z.literal("")),
}).refine(
  (data) => data.estoque_maximo === 0 || data.estoque_minimo <= data.estoque_maximo,
  { message: msg.minGreaterThanMax, path: ["estoque_minimo"] }
);

export type ProdutoFormData = z.infer<typeof produtoSchema>;

// ── Romaneio ──
export const romaneioSchema = z.object({
  motorista: z.string().trim().min(2, msg.min(2)).max(100, msg.max(100)),
  placa_veiculo: z.string().trim().min(7, "Placa deve ter pelo menos 7 caracteres").max(10, msg.max(10))
    .regex(/^[A-Za-z0-9\-]+$/, msg.invalidPlaca),
  tipo_veiculo: z.string().trim().max(50, msg.max(50)).optional().or(z.literal("")),
  data_prevista_entrega: z.string().min(1, "Selecione a data prevista"),
  rota: z.string().trim().max(200, msg.max(200)).optional().or(z.literal("")),
});

export type RomaneioFormData = z.infer<typeof romaneioSchema>;

// ── Helper: extract field errors from ZodError ──
export function extractZodErrors(err: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  err.errors.forEach((e) => {
    const key = e.path[0];
    if (key && !errors[String(key)]) {
      errors[String(key)] = e.message;
    }
  });
  return errors;
}

// ── Helper: validate and return errors or null ──
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: extractZodErrors(result.error) };
}
