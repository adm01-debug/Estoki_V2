// Types para Fornecedor
export type ClassificacaoFornecedor = 'A' | 'B' | 'C' | 'N';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  classificacao: ClassificacaoFornecedor;
  ativo: boolean;
  created_at: string;
}

export interface MetricasFornecedor {
  total_pedidos: number;
  pedidos_no_prazo: number;
  pedidos_atrasados: number;
  taxa_pontualidade: number;
  total_divergencias: number;
  taxa_qualidade: number;
  tempo_medio_entrega: number;
  valor_total: number;
}

export const classificacaoConfig: Record<ClassificacaoFornecedor, { label: string; color: string; descricao: string }> = {
  A: { label: 'A', color: 'bg-green-500', descricao: 'Excelente' },
  B: { label: 'B', color: 'bg-amber-500', descricao: 'Bom' },
  C: { label: 'C', color: 'bg-red-500', descricao: 'Regular' },
  N: { label: 'N', color: 'bg-muted', descricao: 'Não avaliado' },
};
