import { z } from "zod";

export const recebimentoSchema = z.object({
  produto_id: z.string().uuid({ message: "Selecione um produto" }),
  numero_lote: z.string().trim().min(1, { message: "Número do lote é obrigatório" }).max(50, { message: "Máximo 50 caracteres" }),
  fornecedor: z.string().trim().max(100, { message: "Máximo 100 caracteres" }).optional(),
  nf_entrada: z.string().trim().max(50, { message: "Máximo 50 caracteres" }).optional(),
  quantidade_pedida: z.number().int().positive({ message: "Quantidade deve ser maior que 0" }),
  quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que 0" }),
  previsao_chegada: z.string().optional(),
  pedido_compra: z.string().trim().max(50, { message: "Máximo 50 caracteres" }).optional(),
  data_validade: z.string().optional(),
  data_fabricacao: z.string().optional(),
  status: z.enum(['aguardando', 'em_transito', 'recebido', 'em_conferencia', 'conferido', 'divergencia', 'cancelado']),
});

export type RecebimentoFormData = z.infer<typeof recebimentoSchema>;

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  fornecedor_principal?: string;
}
