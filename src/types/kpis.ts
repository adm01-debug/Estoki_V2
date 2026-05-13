/**
 * Tipos centralizados para o sistema de KPIs Operacionais
 */

// Tipos de KPI
export type TipoKPI = 
  | 'triagem'
  | 'picking'
  | 'armazenamento'
  | 'recebimento'
  | 'expedicao'
  | 'qualidade'
  | 'produtividade';

// Tipo de meta (maior é melhor ou menor é melhor)
export type TipoMeta = 'maior_melhor' | 'menor_melhor';

// Status do alerta
export type StatusAlerta = 'ativo' | 'reconhecido' | 'resolvido' | 'ignorado';

// Severidade do alerta
export type SeveridadeAlerta = 'info' | 'warning' | 'critical';

// Período de análise
export type PeriodoAnalise = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano';

/**
 * Métrica operacional diária
 */
export interface MetricaOperacional {
  id: string;
  data: string;
  
  // Triagem
  itens_triados: number | null;
  tempo_total_triagem_minutos: number | null;
  tempo_medio_triagem_minutos: number | null;
  itens_aprovados: number | null;
  itens_reprovados: number | null;
  taxa_aprovacao: number | null;
  
  // Picking/Separação
  pedidos_separados: number | null;
  itens_separados: number | null;
  erros_picking: number | null;
  acuracidade_picking: number | null;
  tempo_total_picking_minutos: number | null;
  
  // Armazenamento
  posicoes_totais: number | null;
  posicoes_ocupados: number | null;
  taxa_ocupacao: number | null;
  
  // Recebimento
  volumes_recebidos: number | null;
  nfs_processadas: number | null;
  tempo_medio_recebimento_minutos: number | null;
  
  // Movimentações
  movimentacoes_realizadas: number | null;
  
  created_at: string;
  updated_at: string;
}

/**
 * Meta de KPI
 */
export interface MetaKPI {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TipoMeta;
  metrica: string;
  valor_meta: number;
  valor_alerta: number | null;
  unidade: string | null;
  ativo: boolean;
  created_at: string;
}

/**
 * Alerta de KPI
 */
export interface AlertaKPI {
  id: string;
  meta_id: string;
  metrica: string;
  valor_atual: number;
  valor_meta: number;
  desvio_percentual: number;
  severidade: SeveridadeAlerta;
  status: StatusAlerta;
  mensagem: string;
  dados_contexto?: Record<string, unknown>;
  created_at: string;
  resolvido_at?: string;
  resolvido_por?: string;
}

/**
 * Histórico de alertas
 */
export interface AlertaHistorico {
  id: string;
  titulo: string;
  mensagem: string;
  severidade: SeveridadeAlerta;
  status: StatusAlerta;
  dados_contexto?: Record<string, unknown>;
  created_at: string;
}

/**
 * KPIs consolidados
 */
export interface KPIConsolidado {
  // Triagem
  totalItensTriados: number;
  tempoMedioTriagem: number;
  taxaAprovacao: number;
  itensAprovados: number;
  itensReprovados: number;
  
  // Picking
  pedidosSeparados: number;
  itensSeparados: number;
  errosPicking: number;
  acuracidadePicking: number;
  
  // Armazenamento
  taxaOcupacao: number;
  posicoesTotais: number;
  posicoesOcupadas: number;
  
  // Recebimento
  volumesRecebidos: number;
  nfsProcessadas: number;
  tempoMedioRecebimento: number;
  
  // Movimentações
  movimentacoesRealizadas: number;
}

/**
 * Evolução de KPI
 */
export interface EvolucaoKPI {
  data: string;
  dataFormatada: string;
  valor: number;
  meta?: number;
  status: 'success' | 'warning' | 'danger';
}

/**
 * Comparativo de períodos
 */
export interface ComparativoPeriodo {
  periodo_atual: number;
  periodo_anterior: number;
  variacao_absoluta: number;
  variacao_percentual: number;
  tendencia: 'up' | 'down' | 'stable';
}

/**
 * Card de KPI para dashboard
 */
export interface KPICard {
  id: string;
  titulo: string;
  valor: number;
  unidade?: string;
  icone: string;
  cor: string;
  meta?: number;
  variacao?: ComparativoPeriodo;
  alerta?: AlertaKPI;
}

/**
 * Configuração de widget de KPI
 */
export interface KPIWidget {
  id: string;
  tipo: 'card' | 'chart' | 'gauge' | 'table';
  metrica: string;
  titulo: string;
  posicao: { x: number; y: number };
  tamanho: { w: number; h: number };
  configuracao?: Record<string, unknown>;
}

/**
 * Dashboard de KPIs
 */
export interface DashboardKPI {
  id: string;
  nome: string;
  descricao?: string;
  widgets: KPIWidget[];
  filtros?: {
    periodo?: PeriodoAnalise;
    setor?: string;
    operador?: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Relatório de KPIs
 */
export interface RelatorioKPI {
  periodo: {
    inicio: string;
    fim: string;
  };
  kpis: KPIConsolidado;
  evolucao: EvolucaoKPI[];
  alertas: AlertaKPI[];
  comparativo: Record<string, ComparativoPeriodo>;
  gerado_em: string;
}
