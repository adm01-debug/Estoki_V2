 import { Package, CheckCircle2, History, MapPin, ArrowRight, Route as RouteIcon, RefreshCw } from "lucide-react";
import { TipoMovimentacao } from "@/hooks/useMovimentacoes";

 export const tipoLabels: Record<TipoMovimentacao, string> = {
   recebimento_nf: "Recebimento NF",
   conferencia: "Conferência",
   triagem_inicio: "Triagem Início",
   triagem_fim: "Triagem Fim",
   armazenamento: "Armazenamento",
   transferencia: "Remanejamento",
   reserva: "Reserva",
   separacao: "Separação",
   conferencia_expedicao: "Conf. Expedição",
   carregamento: "Carregamento",
   saida_transporte: "Saída Transporte",
   entrega: "Entrega",
   devolucao: "Devolução",
   ajuste_estoque: "Ajuste Estoque",
 };

 export const tipoColors: Record<TipoMovimentacao, string> = {
   recebimento_nf: "bg-blue-500/10 text-blue-600 border-blue-500/30",
   conferencia: "bg-purple-500/10 text-purple-600 border-purple-500/30",
   triagem_inicio: "bg-amber-500/10 text-amber-600 border-amber-500/30",
   triagem_fim: "bg-green-500/10 text-green-600 border-green-500/30",
   armazenamento: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
   transferencia: "bg-blue-500/10 text-blue-600 border-blue-500/30",
   reserva: "bg-pink-500/10 text-pink-600 border-pink-500/30",
   separacao: "bg-orange-500/10 text-orange-600 border-orange-500/30",
   conferencia_expedicao: "bg-teal-500/10 text-teal-600 border-teal-500/30",
   carregamento: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
   saida_transporte: "bg-red-500/10 text-red-600 border-red-500/30",
   entrega: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
   devolucao: "bg-rose-500/10 text-rose-600 border-rose-500/30",
   ajuste_estoque: "bg-gray-500/10 text-gray-600 border-gray-500/30",
 };

 export const tipoIcons: Record<TipoMovimentacao, any> = {
   recebimento_nf: Package,
   conferencia: CheckCircle2,
   triagem_inicio: History,
   triagem_fim: CheckCircle2,
   armazenamento: MapPin,
   transferencia: RefreshCw,
   reserva: Package,
   separacao: ArrowRight,
   conferencia_expedicao: CheckCircle2,
   carregamento: RouteIcon,
   saida_transporte: RouteIcon,
   entrega: CheckCircle2,
   devolucao: History,
   ajuste_estoque: History,
 };
