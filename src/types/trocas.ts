// Types para Trocas e Devoluções
export type TipoRegistro = 'troca' | 'devolucao';
export type StatusRegistro = 'pendente' | 'em_analise' | 'autorizado' | 'em_transito' | 'recebido' | 'finalizado' | 'cancelado';
export type UIStatus = 'pendente' | 'em_analise' | 'autorizado' | 'enviado' | 'concluido' | 'cancelado';
export type MotivoTD = 'defeito' | 'tamanho_errado' | 'cor_errada' | 'produto_errado' | 'arrependimento' | 'avaria_transporte' | 'outro';

export interface TrocaDevolucao {
  id: string;
  tipo: TipoRegistro;
  status: StatusRegistro;
  motivo: MotivoTD;
  pedido_original: string;
  cliente: string;
  produto: string;
  quantidade: number;
  valor_unitario?: number;
  observacoes?: string;
  data_solicitacao: string;
  data_autorizacao?: string;
  data_conclusao?: string;
  responsavel?: string;
  codigo_rastreio?: string;
}

export const mapStatusToUI = (status: StatusRegistro): UIStatus => {
  const map: Record<StatusRegistro, UIStatus> = {
    pendente: 'pendente',
    em_analise: 'em_analise',
    autorizado: 'autorizado',
    em_transito: 'enviado',
    recebido: 'enviado',
    finalizado: 'concluido',
    cancelado: 'cancelado',
  };
  return map[status] || 'pendente';
};

export const mapUIStatusToDB = (uiStatus: UIStatus): StatusRegistro => {
  const map: Record<UIStatus, StatusRegistro> = {
    pendente: 'pendente',
    em_analise: 'em_analise',
    autorizado: 'autorizado',
    enviado: 'em_transito',
    concluido: 'finalizado',
    cancelado: 'cancelado',
  };
  return map[uiStatus] || 'pendente';
};

export const statusConfig: Record<UIStatus, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-muted' },
  em_analise: { label: 'Em Análise', color: 'bg-amber-500' },
  autorizado: { label: 'Autorizado', color: 'bg-blue-500' },
  enviado: { label: 'Enviado', color: 'bg-purple-500' },
  concluido: { label: 'Concluído', color: 'bg-green-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500' },
};

export const statusWorkflow: UIStatus[] = ['pendente', 'em_analise', 'autorizado', 'enviado', 'concluido'];

export const motivosDefeito: { value: MotivoTD; label: string }[] = [
  { value: 'defeito', label: 'Defeito de Fabricação' },
  { value: 'tamanho_errado', label: 'Tamanho Errado' },
  { value: 'cor_errada', label: 'Cor Errada' },
  { value: 'produto_errado', label: 'Produto Errado' },
  { value: 'arrependimento', label: 'Arrependimento' },
  { value: 'avaria_transporte', label: 'Avaria no Transporte' },
  { value: 'outro', label: 'Outro' },
];

export const motivoLabels: Record<MotivoTD, string> = {
  defeito: 'Defeito',
  tamanho_errado: 'Tamanho',
  cor_errada: 'Cor',
  produto_errado: 'Produto',
  arrependimento: 'Arrependimento',
  avaria_transporte: 'Avaria',
  outro: 'Outro',
};
