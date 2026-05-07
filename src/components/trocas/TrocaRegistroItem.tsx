import { Badge } from "@/components/ui/badge";
import { Undo2, Package, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { StatusRegistro } from "@/hooks/useTrocasDevolucoes";

export const statusConfig: Record<StatusRegistro, { label: string; color: string; icon: React.ReactNode }> = {
  aberto: { label: "Aberto", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30", icon: <Clock className="h-3 w-3" /> },
  em_analise: { label: "Em Análise", color: "bg-blue-500/10 text-blue-700 border-blue-500/30", icon: <AlertTriangle className="h-3 w-3" /> },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-700 border-green-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  recusado: { label: "Recusado", color: "bg-red-500/10 text-red-700 border-red-500/30", icon: <AlertTriangle className="h-3 w-3" /> },
  em_transito: { label: "Em Trânsito", color: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30", icon: <Package className="h-3 w-3" /> },
  recebido: { label: "Recebido", color: "bg-purple-500/10 text-purple-700 border-purple-500/30", icon: <Package className="h-3 w-3" /> },
  finalizado: { label: "Finalizado", color: "bg-green-500/10 text-green-700 border-green-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
};

interface TrocaRegistroItemProps {
  registro: any;
}

export function TrocaRegistroItem({ registro }: TrocaRegistroItemProps) {
  const status = statusConfig[registro.status as StatusRegistro] || statusConfig.aberto;
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${registro.tipo === 'troca' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
          {registro.tipo === 'troca' ? (
            <Undo2 className={`h-4 w-4 ${registro.tipo === 'troca' ? 'text-blue-500' : 'text-amber-500'}`} />
          ) : (
            <Package className="h-4 w-4 text-amber-500" />
          )}
        </div>
        <div>
          <p className="font-medium">{registro.produto}</p>
          <p className="text-xs text-muted-foreground">
            {registro.fornecedor} • {registro.quantidade} un
          </p>
        </div>
      </div>
      <Badge variant="outline" className={status.color}>
        {status.icon}
        <span className="ml-1">{status.label}</span>
      </Badge>
    </div>
  );
}
