 import { ArrowRight, Package, Truck, RotateCcw, ClipboardEdit, RefreshCw } from "lucide-react";
import { TipoMovimentacao } from "@/hooks/useMovimentacoes";

 export const tiposMovimento: Array<{ value: TipoMovimentacao; label: string; icon: any }> = [
   { value: "armazenamento", label: "Alocação", icon: Package },
   { value: "transferencia", label: "Remanejamento", icon: RefreshCw },
   { value: "separacao", label: "Separação", icon: ArrowRight },
   { value: "saida_transporte", label: "Expedição", icon: Truck },
   { value: "devolucao", label: "Devolução", icon: RotateCcw },
   { value: "ajuste_estoque", label: "Ajuste", icon: ClipboardEdit },
 ];

 export const tipoIcons: Record<string, string> = {
   recebimento_nf: "📥",
   conferencia: "✅",
   triagem_inicio: "🔍",
   triagem_fim: "✔️",
   armazenamento: "📍",
   transferencia: "🔄",
   reserva: "🔒",
   separacao: "📦",
   conferencia_expedicao: "📋",
   carregamento: "🚚",
   saida_transporte: "📤",
   entrega: "🎯",
   devolucao: "↩️",
   ajuste_estoque: "⚖️",
 };

 export const tipoLabels: Record<string, string> = {
   recebimento_nf: "Entrada (NF)",
   conferencia: "Conferência",
   triagem_inicio: "Triagem",
   triagem_fim: "Triagem Finalizada",
   armazenamento: "Alocação",
   transferencia: "Remanejamento",
   reserva: "Reserva",
   separacao: "Separação",
   conferencia_expedicao: "Conf. Expedição",
   carregamento: "Carregamento",
   saida_transporte: "Saída (Transporte)",
   entrega: "Entrega",
   devolucao: "Devolução",
   ajuste_estoque: "Ajuste",
 };
