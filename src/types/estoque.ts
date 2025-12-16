// Tipos do Sistema de Estoque e Triagem

export type StatusPosicao = "livre" | "ocupado" | "reservado" | "bloqueado";

export type StatusRecebimento = 
  | "aguardando" 
  | "chegou" 
  | "conferencia" 
  | "divergencia" 
  | "ok" 
  | "finalizado";

export type StatusTriagem = 
  | "aguardando" 
  | "em_triagem" 
  | "aprovado" 
  | "ressalva" 
  | "reprovado" 
  | "conserto" 
  | "descarte";

export type StatusItem = 
  | "aguardando" 
  | "recebido" 
  | "triagem" 
  | "aprovado" 
  | "armazenado" 
  | "separado";

export type TipoMovimentacao = 
  | "recebimento" 
  | "armazenamento" 
  | "transferencia" 
  | "saida_gravacao" 
  | "retorno_gravacao" 
  | "expedicao" 
  | "ajuste";

export type TipoEmbalagem = "original" | "plastica" | "generica";

export type TipoDefeito = 
  | "arranhao" 
  | "mancha" 
  | "costura" 
  | "componente_faltando" 
  | "cor_diferente" 
  | "tamanho_errado" 
  | "deformacao" 
  | "quebra" 
  | "outro";

export interface PosicaoEstoque {
  id: string;                    // PP1-S05-N2 ou BOX-12
  tipo: "porta-palete" | "box";
  portaPalete?: "PP1" | "PP2" | "PP3";
  secao?: string;                // 01-10
  nivel?: "N1" | "N2" | "N3" | "N4";
  box?: string;                  // 01-16
  status: StatusPosicao;
  itemId?: number;
  volumes?: number[];
  atualizadoEm: Date;
}

export interface Volume {
  numero: number;
  endereco: string;
  status: "armazenado" | "separado" | "em_transito";
}

export interface ItemEstoque {
  id: number;
  pedido: string;               // 2638-1
  produto: string;
  sku?: string;
  lote: string;                 // 2638-1-XBZ-20251216
  fornecedor: string;
  
  // Quantidades
  qtdPedida: number;
  qtdRecebida: number;
  qtdAprovada: number;
  qtdReprovada: number;
  qtdDisponivel: number;
  
  // Volumes
  totalVolumes: number;
  qtdPorVolume: number;
  tipoEmbalagem: TipoEmbalagem;
  descricaoVolumes?: string;
  
  // Localização
  posicoes: Volume[];
  
  // Rastreabilidade
  etiquetasGeradas: boolean;
  etiquetasImpressas: boolean;
  
  // Datas
  dataRecebimento: Date;
  dataTriagem?: Date;
  dataArmazenamento?: Date;
  
  // Status
  status: StatusItem;
}

export interface Recebimento {
  id: number;
  pedido: string;
  fornecedor: string;
  produto: string;
  nf?: string;
  sku?: string;
  qtdPedida: number;
  qtdRecebida?: number;
  qtdVolumes?: number;
  qtdPorVolume?: number;
  tipoEmbalagem?: TipoEmbalagem;
  descricaoVolumes?: string;
  status: StatusRecebimento;
  previsaoChegada?: Date;
  dataChegada?: Date;
  fotos?: string[];
  divergencia?: number;
  percentualDivergencia?: number;
}

export interface TriagemItem {
  id: number;
  itemId: number;
  pedido: string;
  produto: string;
  qtdTotal: number;
  totalVolumes: number;
  
  // Checklist
  checklist: {
    corConforme: boolean;
    tamanhoOk: boolean;
    produtoLimpo: boolean;
    semAvarias: boolean;
    embalagemIntegra: boolean;
    componentesCompletos: boolean;
    funcionalidadeOk: boolean;
  };
  
  // Contagem
  qtdAprovada: number;
  qtdReprovada: number;
  percentualAprovacao: number;
  
  // Defeitos
  defeitos?: {
    tipo: TipoDefeito;
    descricao?: string;
    fotos?: string[];
  }[];
  
  // Teste funcional
  requerTeste: boolean;
  tipoTeste?: string;
  resultadoTeste?: "aprovado" | "reprovado";
  
  status: StatusTriagem;
  triadorId?: number;
  triadorNome?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface Movimentacao {
  id: number;
  tipo: TipoMovimentacao;
  itemId: number;
  pedido: string;
  produto: string;
  volumes: number[];
  quantidade: number;
  
  origem?: string;
  destino?: string;
  
  responsavelId: number;
  responsavelNome: string;
  
  observacao?: string;
  dataHora: Date;
}

export interface KPIData {
  aguardandoRecebimento: number;
  triagemPendente: number;
  itensEstoque: number;
  divergencias: number;
  ocupacaoPP: number;
  boxesOcupados: number;
}
