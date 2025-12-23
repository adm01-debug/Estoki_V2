import { z } from 'zod';

export const estoqueSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório'),
  descricao: z.string().min(1, 'Descrição obrigatória'),
  quantidade: z.number().min(0, 'Quantidade deve ser >= 0'),
  unidade: z.string().min(1, 'Unidade obrigatória'),
});

export const triagemSchema = z.object({
  lote: z.string().min(1, 'Lote obrigatório'),
  quantidade_total: z.number().min(1, 'Quantidade deve ser > 0'),
  tipo_triagem: z.enum(['completa', 'amostragem']),
});

export const recebimentoSchema = z.object({
  nota_fiscal: z.string().min(1, 'NF obrigatória'),
  fornecedor: z.string().min(1, 'Fornecedor obrigatório'),
  data_recebimento: z.string().datetime(),
});

export const usuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cargo: z.string().optional(),
});

export type Estoque = z.infer<typeof estoqueSchema>;
export type Triagem = z.infer<typeof triagemSchema>;
export type Recebimento = z.infer<typeof recebimentoSchema>;
export type Usuario = z.infer<typeof usuarioSchema>;
