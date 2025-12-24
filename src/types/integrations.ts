// Types de integrações
export interface NFe {
  id: string;
  access_key: string;
  number: number;
  series: number;
  issue_date: string;
  operation_type: 'entrada' | 'saida';
  emitter_cnpj: string;
  emitter_name: string;
  total_products: number;
  total_nfe: number;
  status: 'imported' | 'validated' | 'processed' | 'cancelled';
}

export interface CTe {
  id: string;
  access_key: string;
  number: number;
  series: number;
  modal: 'rodoviario' | 'aereo' | 'aquaviario' | 'ferroviario';
  freight_value: number;
  status: string;
}

export interface CarrierQuote {
  carrier: string;
  service: string;
  code: string;
  price: number;
  delivery_days: number;
  delivery_date: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  signature?: string;
}
