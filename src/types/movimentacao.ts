import { Database } from "@/integrations/supabase/types";

export type TipoEventoRastreamento = Database["public"]["Enums"]["tipo_evento_rastreamento"];

export type TipoMovimentacao =
  | TipoEventoRastreamento
  | "transferencia"
  | "recebimento_entrada"
  | "triagem_conferencia"
  | "armazenamento_pallet"
  | "saida_para_gravacao"
  | "retorno_da_gravacao"
  | "saida_para_manuseio"
  | "retorno_do_manuseio"
  | "setor_conserto_entrada"
  | "setor_conserto_saida"
  | "expedicao_saida_conferencia"
  | "expedicao_saida_liberado"
  | "perda_confirmada";

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  produto_id?: string;
  produto_nome?: string;
  lote_id?: string;
  lote_numero?: string;
  quantidade: number;
  localizacao?: string;
  descricao: string;
  operador_id?: string;
  operador_nome?: string;
  created_at: string;
}

export interface MovimentacaoInput {
  tipo: TipoMovimentacao;
  produto_id?: string;
  lote_id?: string;
  quantidade: number;
  localizacao?: string;
  descricao: string;
  from_posicao_id?: string;
  to_posicao_id?: string;
}
