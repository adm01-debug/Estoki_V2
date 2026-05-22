import { z } from "zod";

export const produtoSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório").max(50),
  nome: z.string().min(1, "Nome é obrigatório").max(200),
  descricao: z.string().max(500).optional().nullable(),
  unidade: z.string().default("UN"),
  estoque_minimo: z.number().min(0, "Estoque mínimo deve ser positivo").default(0),
  estoque_maximo: z.number().min(0, "Estoque máximo deve ser positivo").default(0),
  ponto_pedido: z.number().min(0).default(0),
  peso_unitario: z.number().min(0).default(0),
  fornecedor_principal: z.string().max(200).optional().nullable(),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;