export interface PickingTask {
  id: string;
  tipo: string;
  status: string;
  prioridade: string;
  data_inicio?: string;
  data_conclusao?: string;
  produto_id: string;
  produto_nome?: string;
  produto_sku?: string;
  produto_barcode?: string;
  posicao_origem_id: string;
  posicao_origem_codigo?: string;
  quantidade: number;
  quantidade_executada: number;
  zona: string;
  instrucoes?: string;
}
