export type StatusCiclo = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
export type TipoCiclo = 'completo' | 'amostragem' | 'curva_a' | 'curva_b' | 'curva_c' | 'posicao' | 'zona';
export type StatusContagem = 'pendente' | 'em_andamento' | 'concluido' | 'divergencia';

export interface Ciclo {
  id: string;
  nome: string;
  descricao?: string;
  tipo: TipoCiclo;
  status: StatusCiclo;
  data_agendada: string;
  data_inicio?: string;
  data_fim?: string;
  total_posicoes: number;
  posicoes_contadas: number;
  divergencias_encontradas: number;
  acuracidade?: number;
  zona_alvo?: string;
  porta_palete_alvo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contagem {
  id: string;
  ciclo_id: string;
  posicao_id: string;
  produto_id?: string;
  produto_nome?: string;
  lote_id?: string;
  quantidade_sistema: number;
  quantidade_contada?: number;
  quantidade_recontada?: number;
  status: StatusContagem;
  recontagem_necessaria: boolean;
  contado_por?: string;
  recontado_por?: string;
  ajustado_por?: string;
  data_contagem?: string;
  data_recontagem?: string;
  data_ajuste?: string;
  justificativa_ajuste?: string;
  observacoes?: string;
}
