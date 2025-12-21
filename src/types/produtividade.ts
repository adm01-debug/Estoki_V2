// Types para Produtividade
export interface MetricaProdutividade {
  data: string;
  triagens_realizadas: number;
  tempo_medio_triagem: number;
  itens_conferidos: number;
  divergencias_encontradas: number;
  aprovacoes: number;
  reprovacoes: number;
}

export interface RankingOperador {
  id: string;
  nome: string;
  avatar?: string;
  triagens_total: number;
  tempo_medio: number;
  taxa_qualidade: number;
  pontuacao: number;
  posicao: number;
  variacao?: number;
}

export interface MetaProdutividade {
  id: string;
  tipo: 'triagens' | 'tempo' | 'qualidade';
  meta: number;
  atual: number;
  periodo: 'dia' | 'semana' | 'mes';
}

export interface EstatisticasProdutividade {
  total_triagens: number;
  media_tempo: number;
  taxa_aprovacao: number;
  taxa_divergencia: number;
  melhor_dia: string;
  pior_dia: string;
}
