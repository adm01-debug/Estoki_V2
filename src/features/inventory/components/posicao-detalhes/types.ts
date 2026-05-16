export interface ProdutoDetalhes {
  id: string;
  sku: string;
  nome: string;
  descricao?: string;
  unidade?: string;
  curva_abc?: string;
  peso_unitario?: number;
  fornecedor_principal?: string;
}

export interface LoteDetalhes {
  id: string;
  numero_lote: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  data_recebimento: string;
  data_validade?: string;
  data_fabricacao?: string;
  fornecedor?: string;
  nf_entrada?: string;
  pedido_compra?: string;
  status: string;
}

export interface EstoquePosicaoDetalhes {
  id: string;
  quantidade: number;
  data_entrada: string;
  produto: ProdutoDetalhes;
  lote?: LoteDetalhes;
}

import type { StatusPosicao } from "../../hooks/useEstoque";

export const statusConfig: Record<StatusPosicao, { color: string; bg: string; border: string; label: string; icon: string }> = {
  livre: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-dashed border-border", label: "Livre", icon: "⬜" },
  ocupado: { color: "text-success", bg: "bg-success/20", border: "border-success", label: "Ocupado", icon: "🟢" },
  reservado: { color: "text-warning", bg: "bg-warning/20", border: "border-warning", label: "Reservado", icon: "🟡" },
  bloqueado: { color: "text-destructive", bg: "bg-destructive/20", border: "border-destructive", label: "Bloqueado", icon: "🔴" },
};
