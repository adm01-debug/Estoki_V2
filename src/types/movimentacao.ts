// Types para Movimentação
export type TipoMovimentacao = 'entrada' | 'saida' | 'transferencia' | 'ajuste' | 'devolucao';

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  produto_id: string;
  produto_nome?: string;
  lote_id?: string;
  posicao_origem?: string;
  posicao_destino?: string;
  quantidade: number;
  motivo?: string;
  documento_referencia?: string;
  responsavel?: string;
  data_movimentacao: string;
  observacoes?: string;
}

export interface MovimentacaoInput {
  tipo: TipoMovimentacao;
  produto_id: string;
  lote_id?: string;
  posicao_origem?: string;
  posicao_destino?: string;
  quantidade: number;
  motivo?: string;
  documento_referencia?: string;
  observacoes?: string;
}

export const tipoMovimentacaoConfig: Record<TipoMovimentacao, { label: string; color: string }> = {
  entrada: { label: 'Entrada', color: 'bg-green-500' },
  saida: { label: 'Saída', color: 'bg-red-500' },
  transferencia: { label: 'Transferência', color: 'bg-blue-500' },
  ajuste: { label: 'Ajuste', color: 'bg-amber-500' },
  devolucao: { label: 'Devolução', color: 'bg-purple-500' },
};
