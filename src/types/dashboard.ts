// Types para Dashboard
export interface DashboardKPIs {
  recebimentosPendentes: number;
  triagensPendentes: number;
  posicoesCriticas: number;
  divergenciasAbertas: number;
  tarefasPendentes: number;
  ocupacaoEstoque: number;
}

export interface KPICardData {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon: string;
  color: 'success' | 'warning' | 'danger' | 'info';
}

export interface AtividadeRecente {
  id: string;
  tipo: 'recebimento' | 'triagem' | 'movimentacao' | 'tarefa' | 'divergencia';
  descricao: string;
  timestamp: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  usuario?: string;
}

export interface AlertaOperacional {
  id: string;
  tipo: 'critico' | 'alerta' | 'info';
  titulo: string;
  mensagem: string;
  acao?: string;
  timestamp: string;
}
