import { z } from "zod";

/**
 * Schema do formulário de pedido da tabela `public.orders` (codigo, cliente_nome,
 * prioridade numérica). Os schemas `orderSchema`/`orderFormSchema` descrevem um modelo
 * em inglês (order_number/customer_id/product_id) que não existe no banco.
 */
export const pedidoItemFormSchema = z.object({
  produto_id: z.string().uuid("Selecione o produto"),
  quantidade: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser maior que zero"),
});

export const pedidoFormSchema = z.object({
  codigo: z.string().trim().min(1, "Informe o código do pedido").max(40, "Código muito longo"),
  cliente_nome: z
    .string()
    .trim()
    .min(1, "Informe o cliente")
    .max(120, "Nome do cliente muito longo"),
  prioridade: z.number().int().min(1).max(3),
  data_prometida: z.string().trim().optional().default(""),
  observacoes: z.string().trim().max(500, "Máximo de 500 caracteres").optional().default(""),
  warehouse_id: z.string().uuid().optional().or(z.literal("")),
  itens: z.array(pedidoItemFormSchema).min(1, "Adicione pelo menos um item"),
});

export type PedidoItemFormValues = z.infer<typeof pedidoItemFormSchema>;
export type PedidoFormValues = z.infer<typeof pedidoFormSchema>;

export type PedidoStatus =
  "pendente" | "em_separacao" | "embalagem" | "aguardando_transporte" | "enviado" | "cancelado";

/** Fluxo permitido entre colunas do kanban. `enviado` e `cancelado` são finais. */
export const TRANSICOES_PEDIDO: Record<PedidoStatus, PedidoStatus[]> = {
  pendente: ["em_separacao", "cancelado"],
  em_separacao: ["pendente", "embalagem", "cancelado"],
  embalagem: ["em_separacao", "aguardando_transporte", "cancelado"],
  aguardando_transporte: ["embalagem", "enviado", "cancelado"],
  enviado: [],
  cancelado: [],
};

export const ROTULO_STATUS_PEDIDO: Record<PedidoStatus, string> = {
  pendente: "Pendente",
  em_separacao: "Em separação",
  embalagem: "Embalagem",
  aguardando_transporte: "Aguardando transporte",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

export function podeTransicionar(de: string, para: string): boolean {
  const permitidos = TRANSICOES_PEDIDO[de as PedidoStatus];
  return Boolean(permitidos && permitidos.includes(para as PedidoStatus));
}
