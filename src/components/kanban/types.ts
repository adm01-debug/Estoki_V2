export interface LoteKanban {
  id: string;
  numero_lote: string;
  status: string;
  quantidade_atual: number;
  quantidade_inicial: number;
  fornecedor: string | null;
  nf_entrada: string | null;
  data_recebimento: string;
  data_validade: string | null;
  updated_at: string;
  produto: { nome: string; sku: string } | null;
}

export interface KanbanColumnConfig {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgClass: string;
  statuses: string[];
  description: string;
}
