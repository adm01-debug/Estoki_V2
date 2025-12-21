// Types para Gestão de Tarefas
export type StatusTarefa = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada' | 'atrasada';
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente';
export type TipoTarefa = 'recebimento' | 'triagem' | 'armazenamento' | 'separacao' | 'expedicao' | 'inventario' | 'manutencao';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: TipoTarefa;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  responsavel_id?: string;
  responsavel_nome?: string;
  data_criacao: string;
  data_limite?: string;
  data_conclusao?: string;
  lote_id?: string;
  posicao_id?: string;
  observacoes?: string;
}

export interface TarefaInput {
  titulo: string;
  descricao?: string;
  tipo: TipoTarefa;
  prioridade: PrioridadeTarefa;
  responsavel_id?: string;
  data_limite?: string;
}

export const statusTarefaConfig: Record<StatusTarefa, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-muted' },
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-500' },
  concluida: { label: 'Concluída', color: 'bg-green-500' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500' },
  atrasada: { label: 'Atrasada', color: 'bg-amber-500' },
};

export const prioridadeConfig: Record<PrioridadeTarefa, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-gray-400' },
  media: { label: 'Média', color: 'bg-blue-400' },
  alta: { label: 'Alta', color: 'bg-amber-400' },
  urgente: { label: 'Urgente', color: 'bg-red-500' },
};
