import { CheckCircle, Package, Clock, XCircle, AlertTriangle } from "lucide-react";

export interface PosicaoVisual {
  id: string;
  codigo: string;
  zona: string | null;
  porta_palete: string | null;
  secao: string | null;
  nivel: string | null;
  box: string | null;
  status: string;
  tipo: string;
  capacidade_kg: number | null;
}

export interface EstoquePosicao {
  id: string;
  posicao_id: string;
  produto_id: string;
  quantidade: number;
  lote_id: string | null;
  data_entrada: string;
  produtos: { nome: string; sku: string; peso_unitario: number | null } | null;
  lotes: { numero_lote: string; data_validade: string | null } | null;
}

export type ViewMode = "rack" | "grid" | "heatmap";
export type SortMode = "codigo" | "status" | "ocupacao";

export const statusConfig: Record<string, {
  label: string;
  color: string;
  bgClass: string;
  darkBgClass: string;
  icon: typeof CheckCircle;
  heatValue: number;
}> = {
  livre: {
    label: "Livre",
    color: "hsl(var(--success))",
    bgClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    darkBgClass: "bg-emerald-500",
    icon: CheckCircle,
    heatValue: 0,
  },
  ocupada: {
    label: "Ocupada",
    color: "hsl(var(--info))",
    bgClass: "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400",
    darkBgClass: "bg-blue-500",
    icon: Package,
    heatValue: 80,
  },
  reservada: {
    label: "Reservada",
    color: "hsl(var(--warning))",
    bgClass: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
    darkBgClass: "bg-amber-500",
    icon: Clock,
    heatValue: 50,
  },
  bloqueada: {
    label: "Bloqueada",
    color: "hsl(var(--destructive))",
    bgClass: "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400",
    darkBgClass: "bg-red-500",
    icon: XCircle,
    heatValue: 100,
  },
  manutencao: {
    label: "Manutenção",
    color: "hsl(var(--muted-foreground))",
    bgClass: "bg-gray-500/15 border-gray-500/30 text-gray-700 dark:text-gray-400",
    darkBgClass: "bg-gray-500",
    icon: AlertTriangle,
    heatValue: 90,
  },
};

export function getHeatColor(value: number): string {
  if (value <= 0) return "hsl(142, 76%, 36%)";
  if (value <= 30) return "hsl(85, 60%, 45%)";
  if (value <= 60) return "hsl(45, 93%, 47%)";
  if (value <= 80) return "hsl(25, 95%, 53%)";
  return "hsl(0, 72%, 51%)";
}
