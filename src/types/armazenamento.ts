// Tipos para o módulo de Armazenamento

export type TipoPosicao = 'picking' | 'pulmao' | 'blocado' | 'reserva';
export type StatusPosicao = 'disponivel' | 'ocupado' | 'bloqueado' | 'manutencao';
export type ZonaArmazem = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Posicao {
  id: string;
  codigo: string;
  zona: ZonaArmazem;
  corredor: string;
  prateleira: string;
  nivel: number;
  tipo: TipoPosicao;
  status: StatusPosicao;
  capacidade: number;
  ocupado: number;
  produto_id?: string;
  produto_nome?: string;
  produto_sku?: string;
  ultima_movimentacao?: string;
  created_at: string;
  updated_at: string;
}

export interface MapaEstoque {
  zona: ZonaArmazem;
  corredores: CorredorInfo[];
  estatisticas: EstatisticasZona;
}

export interface CorredorInfo {
  codigo: string;
  prateleiras: PrateleiraInfo[];
  ocupacao: number;
}

export interface PrateleiraInfo {
  codigo: string;
  niveis: NivelInfo[];
  ocupacao: number;
}

export interface NivelInfo {
  nivel: number;
  posicao: Posicao;
}

export interface EstatisticasZona {
  totalPosicoes: number;
  ocupadas: number;
  disponiveis: number;
  bloqueadas: number;
  percentualOcupacao: number;
}

export interface FiltrosArmazenamento {
  zona?: ZonaArmazem;
  corredor?: string;
  tipo?: TipoPosicao;
  status?: StatusPosicao;
  busca?: string;
}

export interface MovimentacaoArmazenamento {
  id: string;
  posicao_origem_id?: string;
  posicao_destino_id: string;
  produto_id: string;
  quantidade: number;
  tipo: 'entrada' | 'saida' | 'transferencia';
  motivo: string;
  usuario_id: string;
  created_at: string;
}

export interface SugestaoArmazenamento {
  posicao: Posicao;
  score: number;
  motivos: string[];
}

export interface ArmazenamentoInput {
  zona: ZonaArmazem;
  corredor: string;
  prateleira: string;
  nivel: number;
  tipo: TipoPosicao;
  capacidade: number;
}
