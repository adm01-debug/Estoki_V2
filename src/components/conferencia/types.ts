import { VolumeData as SharedVolumeData } from "@/features/quality/components/VolumeContagem";

export type VolumeData = SharedVolumeData;
export type StatusRecebimento = "aguardando" | "em_transito" | "recebido" | "em_conferencia" | "conferido" | "divergencia" | "cancelado";

export type TipoEmbalagem = "original" | "plastica" | "generica";

export interface Recebimento {
  id: string;
  numero_lote: string;
  produto_id: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  quantidade_pedida: number | null;
  fornecedor: string | null;
  nf_entrada: string | null;
  previsao_chegada: string | null;
  pedido_compra: string | null;
  data_validade: string | null;
  data_fabricacao: string | null;
  status: StatusRecebimento;
  observacoes_conferencia: string | null;
  conferido_por: string | null;
  data_conferencia: string | null;
  data_recebimento: string;
  created_at: string;
  updated_at: string;
  produto_nome?: string;
}
