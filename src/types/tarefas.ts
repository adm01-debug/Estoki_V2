// Types para Gestão de Tarefas
export type StatusTarefa = 'pendente' | 'atribuida' | 'em_andamento' | 'concluida' | 'cancelada' | 'atrasada' | 'bloqueado';
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente';
export type TipoTarefa = 'recebimento' | 'triagem' | 'armazenamento' | 'separacao' | 'expedicao' | 'inventario' | 'manutencao' | 'transferencia';
export const tipoLabels: Record<string, string> = {
  separacao: "Separação", 
  armazenagem: "Armazenagem", 
  transferencia: "Transferência",
  inventario: "Inventário", 
  expedicao: "Expedição",
  recebimento: "Recebimento",
  triagem: "Triagem",
  manutencao: "Manutenção"
};

export const statusLabels: Record<string, string> = {
  pendente: "Pendente", 
  atribuida: "Atribuída", 
  em_andamento: "Em Andamento",
  concluida: "Concluída", 
  bloqueado: "Bloqueada",
  cancelada: "Cancelada",
  atrasada: "Atrasada"
};

export const statusColors: Record<string, string> = {
  pendente: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  atribuida: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  em_andamento: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  concluida: "bg-green-500/10 text-green-600 border-green-500/30",
  bloqueado: "bg-red-500/10 text-red-600 border-red-500/30",
  cancelada: "bg-red-500/10 text-red-600 border-red-500/30",
  atrasada: "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

export const prioridadeLabels: Record<string, string> = {
  baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente",
};

export const prioridadeColors: Record<string, string> = {
  baixa: "bg-gray-500/10 text-gray-600", 
  media: "bg-blue-500/10 text-blue-600",
  alta: "bg-amber-500/10 text-amber-600", 
  urgente: "bg-red-500/10 text-red-600",
};

 export interface Tarefa {
   id: string;
   descricao: string | null;
   tipo: string;
   status: string;
   prioridade: string;
   responsavel_id?: string | null;
   created_at: string;
   data_inicio?: string | null;
   data_conclusao?: string | null;
   lote_id?: string | null;
   posicao_id?: string | null;
   quantidade?: number;
   zona?: string | null;
 }

export interface TarefaInput {
  titulo: string;
  descricao?: string;
  tipo: TipoTarefa;
  prioridade: PrioridadeTarefa;
  responsavel_id?: string;
  data_limite?: string;
}

