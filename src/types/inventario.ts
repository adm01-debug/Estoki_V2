// Types para Inventário Cíclico
export type StatusCiclo = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
export type TipoCiclo = 'curva_a' | 'curva_b' | 'curva_c' | 'geral' | 'amostragem';
export type StatusContagem = 'pendente' | 'em_contagem' | 'conferido' | 'divergente' | 'ajustado';

export interface Ciclo {
  id: string;
  codigo: string;
  tipo: TipoCiclo;
  status: StatusCiclo;
  data_inicio: string;
  data_fim?: string;
  responsavel?: string;
  posicoes_total: number;
  posicoes_contadas: number;
  divergencias: number;
  observacoes?: string;
  created_at: string;
}

export interface Contagem {
  id: string;
  ciclo_id: string;
  posicao_id: string;
  posicao_codigo: string;
  produto_id?: string;
  produto_nome?: string;
  quantidade_sistema: number;
  quantidade_contada?: number;
  status: StatusContagem;
  diferenca?: number;
  responsavel?: string;
  data_contagem?: string;
  observacoes?: string;
}

export const statusCicloConfig: Record<StatusCiclo, { label: string; color: string }> = {
  planejado: { label: 'Planejado', color: 'bg-muted' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-500' },
  concluido: { label: 'Concluído', color: 'bg-green-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500' },
};

export const tipoCicloConfig: Record<TipoCiclo, { label: string; descricao: string }> = {
  curva_a: { label: 'Curva A', descricao: 'Itens de alto giro' },
  curva_b: { label: 'Curva B', descricao: 'Itens de médio giro' },
  curva_c: { label: 'Curva C', descricao: 'Itens de baixo giro' },
  geral: { label: 'Geral', descricao: 'Todos os itens' },
  amostragem: { label: 'Amostragem', descricao: 'Amostra aleatória' },
};

export const statusContagemConfig: Record<StatusContagem, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-muted' },
  em_contagem: { label: 'Em Contagem', color: 'bg-blue-500' },
  conferido: { label: 'Conferido', color: 'bg-green-500' },
  divergente: { label: 'Divergente', color: 'bg-red-500' },
  ajustado: { label: 'Ajustado', color: 'bg-purple-500' },
};
