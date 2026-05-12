 import { Card, CardContent } from "@/components/ui/card";
 import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
 import { BarChart3, Package, TrendingUp, AlertTriangle, ClipboardList } from "lucide-react";
import { DashboardKPIs as DashboardKPIsInterface } from "@/hooks/useDashboard";

interface DashboardKPIsProps {
  kpis: DashboardKPIsInterface;
}

export function DashboardKPIs({ kpis }: DashboardKPIsProps) {
  const safeKpis = kpis || { 
    totalPosicoes: 0, 
    posicoesOcupadas: 0, 
    taxaOcupacao: 0, 
    itensParados30dias: 0, 
    valorParado: 0, 
    giroMedio: 0, 
    entradasHoje: 0, 
    saidasHoje: 0, 
    triagensHoje: 0, 
    triagensPendentes: 0 
  };

   const getOcupacaoColor = (percent: number) => {
     if (percent >= 90) return "text-red-600";
     if (percent >= 70) return "text-yellow-600";
     return "text-green-600";
   };

   return (
     <div className="space-y-4">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <Card className="hover:shadow-md transition-shadow cursor-default">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Taxa Ocupação</span>
          </div>
           <p className={cn("text-2xl font-bold", getOcupacaoColor(safeKpis.taxaOcupacao))}>{safeKpis.taxaOcupacao}%</p>
           <Progress 
             value={safeKpis.taxaOcupacao} 
             className="mt-2 h-1.5" 
             indicatorClassName={cn(
               safeKpis.taxaOcupacao >= 90 ? "bg-red-600" : 
               safeKpis.taxaOcupacao >= 70 ? "bg-yellow-600" : "bg-green-600"
             )} 
           />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            <span className="text-xs">Posições</span>
          </div>
          <p className="text-2xl font-bold">
            {safeKpis.posicoesOcupadas}
            <span className="text-sm font-normal text-muted-foreground">/{safeKpis.totalPosicoes}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Giro Médio</span>
          </div>
          <p className="text-2xl font-bold">
            {safeKpis.giroMedio}
            <span className="text-sm font-normal text-muted-foreground"> dias</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Parados +30d</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{safeKpis.itensParados30dias}</p>
          <p className="text-xs text-muted-foreground">R$ {(safeKpis.valorParado || 0).toLocaleString()}</p>
        </CardContent>
       </Card>
     </div>

     <div className="grid grid-cols-2 gap-3">
       <Card className="bg-blue-500/5 border-blue-500/20">
         <CardContent className="p-4 flex items-center justify-between">
           <div>
             <div className="flex items-center gap-2 text-blue-600 mb-1">
               <ClipboardList className="h-4 w-4" />
               <span className="text-xs font-medium">Triagens Hoje</span>
             </div>
             <p className="text-2xl font-bold text-blue-700">{safeKpis.triagensHoje}</p>
           </div>
           <div className="text-right">
             <span className="text-xs text-muted-foreground block">Pendentes</span>
             <span className="text-sm font-semibold text-orange-600">{safeKpis.triagensPendentes}</span>
           </div>
         </CardContent>
       </Card>
       
       <Card className="bg-green-500/5 border-green-500/20">
         <CardContent className="p-4 flex items-center justify-between">
           <div>
             <div className="flex items-center gap-2 text-green-600 mb-1">
               <TrendingUp className="h-4 w-4" />
               <span className="text-xs font-medium">Fluxo Hoje</span>
             </div>
             <div className="flex gap-4">
               <div>
                 <span className="text-[10px] uppercase text-muted-foreground block">Entradas</span>
                 <p className="text-xl font-bold text-green-700">{safeKpis.entradasHoje}</p>
               </div>
               <div>
                 <span className="text-[10px] uppercase text-muted-foreground block">Saídas</span>
                 <p className="text-xl font-bold text-red-600">{safeKpis.saidasHoje}</p>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
   </div>
   );
 }