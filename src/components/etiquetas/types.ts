export interface EtiquetaData {
  pedido: string;
  produto: string;
  lote: string;
  fornecedor: string;
  totalVolumes: number;
  qtdPorVolume: number;
  dataRecebimento: Date;
}

export type TamanhoEtiqueta = "10x7" | "8x5";

export const tamanhos: Record<TamanhoEtiqueta, { width: number; height: number; label: string }> = {
  "10x7": { width: 100, height: 70, label: "10 x 7 cm" },
  "8x5": { width: 80, height: 50, label: "8 x 5 cm" },
};
