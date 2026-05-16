export type StatusRomaneio = 'rascunho' | 'confirmado' | 'em_transito' | 'entregue' | 'parcial' | 'cancelado';
export type StatusEntrega = 'pendente' | 'em_rota' | 'entregue' | 'recusado' | 'parcial' | 'reagendado';

export interface RomaneioItem {
  id: string;
  romaneio_id: string;
  cliente: string;
  endereco_entrega: string;
  telefone_cliente?: string;
  quantidade: number;
  peso_kg?: number;
  ordem_entrega?: number;
  nf_saida?: string;
  observacoes?: string;
  status?: StatusEntrega;
}

export interface Romaneio {
  id: string;
  codigo: string;
  data_criacao: string;
  data_prevista_entrega?: string;
  data_saida?: string;
  data_retorno?: string;
  motorista?: string;
  placa_veiculo?: string;
  tipo_veiculo?: string;
  rota?: string;
  status: StatusRomaneio;
  total_entregas: number;
  entregas_realizadas: number;
  total_volumes: number;
  total_peso_kg: number;
  itens: RomaneioItem[];
}

export interface RomaneioInput {
  motorista?: string;
  placa_veiculo?: string;
  tipo_veiculo?: string;
  data_prevista_entrega?: string;
  rota?: string;
  observacoes?: string;
}

export interface RomaneioItemInput {
  cliente: string;
  endereco_entrega: string;
  telefone_cliente?: string;
  quantidade: number;
  peso_kg?: number;
  nf_saida?: string;
  observacoes?: string;
}
