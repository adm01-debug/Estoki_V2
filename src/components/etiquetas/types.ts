export interface EtiquetaData {
  pedido: string;
  produto: string;
  lote: string;
  fornecedor: string;
  totalVolumes: number;
  qtdPorVolume: number;
  dataRecebimento: Date;
}

export interface LoteItem {
  id: string;
  numero_lote: string;
  produto_id: string;
  quantidade_atual: number;
  fornecedor: string | null;
  data_recebimento: string;
  nf_entrada: string | null;
  produto_nome?: string;
  produto_sku?: string;
}

export interface EntregaItem {
  id: string;
  cliente: string;
  endereco_entrega: string;
  pedido_referencia: string | null;
  nf_saida: string | null;
  quantidade: number;
  peso_kg: number | null;
  ordem_entrega: number | null;
  romaneio_id: string;
  romaneio_codigo?: string;
  produto_nome?: string;
}

export type FonteData = "lotes" | "entregas";

export type TamanhoEtiqueta = "10x15" | "10x7" | "8x5";

export const tamanhos: Record<TamanhoEtiqueta, { width: number; height: number; label: string }> = {
  "10x15": { width: 100, height: 150, label: "10 x 15 cm" },
  "10x7": { width: 100, height: 70, label: "10 x 7 cm" },
  "8x5": { width: 80, height: 50, label: "8 x 5 cm" },
};
