import { z } from 'zod';

export const produtoEstoqueSchema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  unidade: z.string().default('UN'),
  quantidade: z.coerce.number().int().min(0).default(0),
  localizacao: z.string().optional(),
  lote: z.string().optional(),
  validade: z.string().optional(),
  custo_unitario: z.coerce.number().positive().optional(),
  ativo: z.coerce.boolean().default(true),
});

export const movimentacaoSchema = z.object({
  produto_id: z.string().uuid(),
  tipo: z.enum(['entrada', 'saida', 'transferencia', 'ajuste']),
  quantidade: z.coerce.number().int().positive(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  documento: z.string().optional(),
  observacoes: z.string().optional(),
});

export const inventarioSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade_sistema: z.coerce.number().int().min(0),
  quantidade_fisica: z.coerce.number().int().min(0),
  diferenca: z.coerce.number().int(),
  justificativa: z.string().optional(),
  status: z.enum(['pendente', 'aprovado', 'rejeitado']).default('pendente'),
});

export const wmsImportTemplates = {
  produtos: [
    { key: 'codigo', label: 'Código', example: 'SKU-001' },
    { key: 'nome', label: 'Nome', example: 'Produto X' },
    { key: 'quantidade', label: 'Quantidade', example: '100' },
    { key: 'localizacao', label: 'Localização', example: 'A1-01-01' },
    { key: 'custo_unitario', label: 'Custo', example: '25.50' },
  ],
  movimentacoes: [
    { key: 'produto_codigo', label: 'Código Produto', example: 'SKU-001' },
    { key: 'tipo', label: 'Tipo', example: 'entrada' },
    { key: 'quantidade', label: 'Quantidade', example: '50' },
    { key: 'documento', label: 'Documento', example: 'NF-12345' },
  ],
};

export const wmsFilterConfigs = {
  produtos: [
    { key: 'ativo', label: 'Status', type: 'select' as const, options: [{ value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }] },
    { key: 'localizacao', label: 'Localização', type: 'text' as const },
  ],
  movimentacoes: [
    { key: 'tipo', label: 'Tipo', type: 'select' as const, options: [
      { value: 'entrada', label: 'Entrada' },
      { value: 'saida', label: 'Saída' },
      { value: 'transferencia', label: 'Transferência' },
      { value: 'ajuste', label: 'Ajuste' },
    ]},
  ],
};
