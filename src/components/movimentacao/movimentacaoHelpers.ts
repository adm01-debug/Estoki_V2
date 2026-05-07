import { ArrowRight, Package, Truck, RotateCcw, ClipboardEdit } from "lucide-react";
import { TipoMovimentacao } from "@/hooks/useMovimentacoes";

export const tiposMovimento: Array<{ value: TipoMovimentacao; label: string; icon: any }> = [
  { value: "armazenamento", label: "Armazenamento", icon: Package },
  { value: "separacao", label: "Separação", icon: ArrowRight },
  { value: "saida_transporte", label: "Saída para Transporte", icon: Truck },
  { value: "devolucao", label: "Devolução", icon: RotateCcw },
  { value: "ajuste_estoque", label: "Ajuste de Inventário", icon: ClipboardEdit },
];

export const tipoIcons: Record<string, string> = {
  recebimento_nf: "📦",
  conferencia: "✅",
  triagem_inicio: "🔍",
  triagem_fim: "✔️",
  armazenamento: "📥",
  reserva: "🔒",
  separacao: "📤",
  conferencia_expedicao: "📋",
  carregamento: "🚚",
  saida_transporte: "🚀",
  entrega: "🎯",
  devolucao: "↩️",
  ajuste_estoque: "📝",
};

export const tipoLabels: Record<string, string> = {
  recebimento_nf: "RECEBIMENTO NF",
  conferencia: "CONFERÊNCIA",
  triagem_inicio: "TRIAGEM INÍCIO",
  triagem_fim: "TRIAGEM FIM",
  armazenamento: "ARMAZENAMENTO",
  reserva: "RESERVA",
  separacao: "SEPARAÇÃO",
  conferencia_expedicao: "CONF. EXPEDIÇÃO",
  carregamento: "CARREGAMENTO",
  saida_transporte: "SAÍDA TRANSPORTE",
  entrega: "ENTREGA",
  devolucao: "DEVOLUÇÃO",
  ajuste_estoque: "AJUSTE ESTOQUE",
};
