export interface MetricaOperacional {
  id: string;
  data: string;
  itens_triados: number | null;
  tempo_total_triagem_minutos: number | null;
  tempo_medio_triagem_minutos: number | null;
  itens_aprovados: number | null;
  itens_reprovados: number | null;
  taxa_aprovacao: number | null;
  pedidos_separados: number | null;
  itens_separados: number | null;
  erros_picking: number | null;
  acuracidade_picking: number | null;
  tempo_total_picking_minutos: number | null;
  posicoes_totais: number | null;
  posicoes_ocupadas: number | null;
  taxa_ocupacao: number | null;
  volumes_recebidos: number | null;
  nfs_processadas: number | null;
  tempo_medio_recebimento_minutos: number | null;
  movimentacoes_realizadas: number | null;
}

export interface MetaKPI {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  metrica: string;
  valor_meta: number;
  unidade: string | null;
  ativo: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface KPIConsolidado {
  totalItensTriados: number;
  tempoMedioTriagem: number;
  taxaAprovacao: number;
  itensAprovados: number;
  itensReprovados: number;
  pedidosSeparados: number;
  itensSeparados: number;
  errosPicking: number;
  acuracidadePicking: number;
  taxaOcupacao: number;
  posicoesTotais: number;
  posicoesOcupadas: number;
  volumesRecebidos: number;
  nfsProcessadas: number;
  tempoMedioRecebimento: number;
  movimentacoesRealizadas: number;
}

export interface EvolucaoDiaria {
  data: string;
  dataFormatada: string;
  itensTriados: number;
  pedidosSeparados: number;
  taxaAprovacao: number;
  acuracidadePicking: number;
}

export interface UseKPIsOperacionaisReturn {
  metricas: MetricaOperacional[];
  metas: MetaKPI[];
  kpisConsolidados: KPIConsolidado;
  evolucaoDiaria: EvolucaoDiaria[];
  evolucaoSemanal: { semana: string; media: number }[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  salvarMeta: (meta: Partial<MetaKPI>) => Promise<void>;
  excluirMeta: (id: string) => Promise<void>;
  getMetricaPorData: (data: string) => MetricaOperacional | undefined;
  getKPIStatus: (metrica: string, valor: number) => 'success' | 'warning' | 'danger';
  calcularVariacao: (metrica: string) => { valor: number; tipo: 'up' | 'down' | 'stable' };
}
