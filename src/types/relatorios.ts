// Tipos para o módulo de Relatórios

export type TipoRelatorio = 
  | 'estoque' 
  | 'movimentacoes' 
  | 'recebimentos' 
  | 'triagens'
  | 'produtividade'
  | 'divergencias'
  | 'fornecedores'
  | 'trocas'
  | 'inventario'
  | 'kpis';

export type FormatoExportacao = 'pdf' | 'xlsx' | 'csv';
export type PeriodoRelatorio = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'personalizado';

export interface FiltrosRelatorio {
  tipo: TipoRelatorio;
  periodo: PeriodoRelatorio;
  dataInicio?: string;
  dataFim?: string;
  categoria?: string;
  fornecedor?: string;
  usuario?: string;
  status?: string;
}

export interface RelatorioConfig {
  id: string;
  nome: string;
  tipo: TipoRelatorio;
  descricao: string;
  icone: string;
  filtros: FiltrosRelatorio;
  colunas: ColunaRelatorio[];
  ordenacao?: OrdenacaoRelatorio;
  agrupamento?: string;
}

export interface ColunaRelatorio {
  campo: string;
  label: string;
  tipo: 'texto' | 'numero' | 'data' | 'moeda' | 'percentual' | 'badge';
  visivel: boolean;
  largura?: number;
  formatacao?: string;
}

export interface OrdenacaoRelatorio {
  campo: string;
  direcao: 'asc' | 'desc';
}

export interface DadosRelatorio {
  titulo: string;
  subtitulo?: string;
  periodo: string;
  geradoEm: string;
  geradoPor: string;
  dados: Record<string, unknown>[];
  totais?: Record<string, number>;
  graficos?: GraficoRelatorio[];
}

export interface GraficoRelatorio {
  tipo: 'linha' | 'barra' | 'pizza' | 'area';
  titulo: string;
  dados: {
    labels: string[];
    datasets: DatasetGrafico[];
  };
}

export interface DatasetGrafico {
  label: string;
  data: number[];
  cor?: string;
}

export interface AgendamentoRelatorio {
  id: string;
  relatorioId: string;
  frequencia: 'diario' | 'semanal' | 'mensal';
  horario: string;
  destinatarios: string[];
  formato: FormatoExportacao;
  ativo: boolean;
}

export interface HistoricoRelatorio {
  id: string;
  relatorioId: string;
  geradoEm: string;
  geradoPor: string;
  formato: FormatoExportacao;
  tamanhoBytes: number;
  url?: string;
}

export interface EstatisticasRelatorios {
  totalGerados: number;
  ultimoGerado?: string;
  maisUsado?: TipoRelatorio;
  tempoMedioGeracao: number;
}
