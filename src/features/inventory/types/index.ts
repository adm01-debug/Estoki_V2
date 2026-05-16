import type { Database } from '@/integrations/supabase/types';

export type PosicaoInsert = Database['public']['Tables']['posicoes_estoque']['Insert'];
export type PosicaoUpdate = Database['public']['Tables']['posicoes_estoque']['Update'];

export type StatusPosicao = 'livre' | 'ocupado' | 'reservado' | 'bloqueado';
export type TipoPosicao = 'porta_palete' | 'box';

export interface SaldoPosicao {
  id: string;
  produto_id: string;
  lote_id: string | null;
  quantidade: number;
  data_entrada: string;
  produto?: {
    nome: string;
    sku: string;
    curva_abc?: string | null;
  };
  lote?: {
    numero_lote: string;
    data_validade?: string;
  };
}

export interface PosicaoEstoque {
  id: string;
  codigo: string;
  tipo: TipoPosicao;
  status: StatusPosicao;
  zona?: string | null;
  secao?: string | null;
  nivel?: string | null;
  porta_palete?: string | null;
  box?: string | null;
  capacidade_kg?: number | null;
  bloqueado_por?: string | null;
  bloqueado_em?: string | null;
  reservado_por?: string | null;
  reservado_em?: string | null;
  created_at: string;
  updated_at: string;
  saldos?: SaldoPosicao[];
}