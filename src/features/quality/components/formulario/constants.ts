export const checklistItems = [
  { id: "corConforme", label: "Cor conforme pedido" },
  { id: "tamanhoOk", label: "Tamanho/dimensões OK" },
  { id: "produtoLimpo", label: "Produto limpo" },
  { id: "semAvarias", label: "Sem avarias/defeitos visíveis" },
  { id: "embalagemIntegra", label: "Embalagem íntegra" },
  { id: "componentesCompletos", label: "Componentes completos" },
  { id: "funcionalidadeOk", label: "Funcionalidade OK" },
];

export type StatusTriagem = 'em_andamento' | 'aprovado' | 'ressalva' | 'reprovado';
