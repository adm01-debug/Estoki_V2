export interface Posicao {
  id: string;
  codigo: string;
  corredor: string;
  prateleira: string;
  nivel: string;
  tipo: PosicaoTipo;
  status: PosicaoStatus;
  capacidade_max: number;
  ocupacao_atual: number;
  produto_id?: string;
  lote_id?: string;
  created_at: string;
  updated_at: string;
}

export type PosicaoTipo = "picking" | "pulmao" | "blocado" | "chao";
export type PosicaoStatus = "livre" | "ocupada" | "reservada" | "bloqueada";

export interface PosicaoFilter {
  corredor?: string;
  tipo?: PosicaoTipo;
  status?: PosicaoStatus;
  search?: string;
}

export interface PosicaoStats {
  total: number;
  ocupadas: number;
  livres: number;
  reservadas: number;
  bloqueadas: number;
  ocupacaoPercentual: number;
}
