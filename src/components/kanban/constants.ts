import { Clock, Package, Search, Archive, ArrowRight, Truck, AlertTriangle } from "lucide-react";
import { KanbanColumnConfig } from "./types";

export const PIPELINE_COLUMNS: KanbanColumnConfig[] = [
  { 
    id: "aguardando", 
    title: "Aguardando", 
    icon: Clock, 
    color: "hsl(var(--muted-foreground))",
    bgClass: "border-t-2 border-t-muted-foreground/50",
    statuses: ["aguardando", "em_transito"],
    description: "Lotes aguardando recebimento"
  },
  { 
    id: "recebido", 
    title: "Recebido", 
    icon: Package, 
    color: "hsl(var(--primary))",
    bgClass: "border-t-2 border-t-primary",
    statuses: ["recebido", "em_conferencia"],
    description: "Lotes recebidos, em conferência"
  },
  { 
    id: "conferido", 
    title: "Conferido / Triagem", 
    icon: Search, 
    color: "hsl(45, 93%, 47%)",
    bgClass: "border-t-2 border-t-warning",
    statuses: ["conferido"],
    description: "Lotes conferidos, prontos para armazenamento"
  },
  { 
    id: "armazenado", 
    title: "Armazenado", 
    icon: Archive, 
    color: "hsl(142, 76%, 36%)",
    bgClass: "border-t-2 border-t-success",
    statuses: ["armazenado"],
    description: "Lotes armazenados em posições"
  },
  { 
    id: "separacao", 
    title: "Em Separação", 
    icon: ArrowRight, 
    color: "hsl(262, 83%, 58%)",
    bgClass: "border-t-2 border-t-[hsl(262,83%,58%)]",
    statuses: ["em_separacao"],
    description: "Lotes em processo de picking"
  },
  { 
    id: "expedido", 
    title: "Expedido / Entregue", 
    icon: Truck, 
    color: "hsl(var(--success))",
    bgClass: "border-t-2 border-t-success",
    statuses: ["expedido", "entregue"],
    description: "Lotes expedidos ou entregues"
  },
  { 
    id: "divergencia", 
    title: "Divergência", 
    icon: AlertTriangle, 
    color: "hsl(var(--destructive))",
    bgClass: "border-t-2 border-t-destructive",
    statuses: ["divergencia", "cancelado"],
    description: "Lotes com problemas"
  },
];
