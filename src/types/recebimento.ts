// Types para Recebimento
export type StatusRecebimento = 'aguardando' | 'em_transito' | 'recebido' | 'em_conferencia' | 'conferido' | 'divergencia' | 'cancelado';

export interface Recebimento {
  id: string;
  numero_pedido: string;
  fornecedor: string;
  produto: string;
  quantidade_esperada: number;
  quantidade_conferida?: number;
  peso_esperado?: number;
  peso_conferido?: number;
  status: StatusRecebimento;
  data_prevista?: string;
  data_recebimento?: string;
  observacoes?: string;
  responsavel?: string;
}

export interface RecebimentoInput {
  numero_pedido: string;
  fornecedor: string;
  produto: string;
  quantidade_esperada: number;
  peso_esperado?: number;
  data_prevista?: string;
  observacoes?: string;
}

export const statusRecebimentoConfig: Record<StatusRecebimento, { label: string; color: string }> = {
  aguardando: { label: 'Aguardando', color: 'bg-muted' },
  em_transito: { label: 'Em Trânsito', color: 'bg-blue-500' },
  recebido: { label: 'Recebido', color: 'bg-amber-500' },
  em_conferencia: { label: 'Em Conferência', color: 'bg-orange-500' },
  conferido: { label: 'Conferido', color: 'bg-green-500' },
  divergencia: { label: 'Divergência', color: 'bg-red-500' },
  cancelado: { label: 'Cancelado', color: 'bg-destructive' },
};
