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
 export type PosicaoStatus = "livre" | "ocupado" | "reservado" | "bloqueado";

export interface PosicaoFilter {
  corredor?: string;
  tipo?: PosicaoTipo;
  status?: PosicaoStatus;
  search?: string;
}

export interface PosicaoStats {
  total: number;
  ocupados: number;
  livres: number;
  reservados: number;
  bloqueados: number;
  ocupacaoPercentual: number;
}
