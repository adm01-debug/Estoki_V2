  import { Card, CardContent } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
 import { Progress } from "@/components/ui/progress";
  import { BarChart3, Package, TrendingUp, AlertTriangle, ClipboardList, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
     <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="glass-card border-border/30 group hover:border-primary/30 transition-all duration-300">
           <CardContent className="p-5">
             <div className="flex items-center justify-between mb-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                 <BarChart3 className="h-5 w-5 text-primary" />
               </div>
               <div className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                 <ArrowUpRight className="h-3 w-3" />2.4%
               </div>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Taxa de Ocupação</p>
               <p className={cn("text-3xl font-black tracking-tight", getOcupacaoColor(safeKpis.taxaOcupacao))}>{safeKpis.taxaOcupacao}%</p>
             </div>
             <Progress 
               value={safeKpis.taxaOcupacao} 
               className="mt-4 h-1.5 bg-muted/30" 
               indicatorClassName={cn(
                 "transition-all duration-500",
                 safeKpis.taxaOcupacao >= 90 ? "bg-destructive" : 
                 safeKpis.taxaOcupacao >= 70 ? "bg-warning" : "bg-success"
               )} 
             />
           </CardContent>
         </Card>

         <Card className="glass-card border-border/30 group hover:border-primary/30 transition-all duration-300">
           <CardContent className="p-5">
             <div className="flex items-center justify-between mb-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                 <Package className="h-5 w-5 text-primary" />
               </div>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Posições Ativas</p>
               <div className="flex items-baseline gap-1">
                 <p className="text-3xl font-black tracking-tight text-foreground">{safeKpis.posicoesOcupadas}</p>
                 <span className="text-sm font-bold text-muted-foreground">/ {safeKpis.totalPosicoes}</span>
               </div>
             </div>
             <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase">Capacidade Instalada</p>
           </CardContent>
         </Card>
 
         <Card className="glass-card border-border/30 group hover:border-primary/30 transition-all duration-300">
           <CardContent className="p-5">
             <div className="flex items-center justify-between mb-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                 <TrendingUp className="h-5 w-5 text-primary" />
               </div>
               <div className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                 <ArrowDownRight className="h-3 w-3" />1.2%
               </div>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Giro Médio</p>
               <div className="flex items-baseline gap-1">
                 <p className="text-3xl font-black tracking-tight text-foreground">{safeKpis.giroMedio}</p>
                 <span className="text-sm font-bold text-muted-foreground">dias</span>
               </div>
             </div>
             <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase">Meta: 15 dias</p>
           </CardContent>
         </Card>
 
         <Card className="glass-card border-warning/20 bg-warning/5 group hover:border-warning/40 transition-all duration-300">
           <CardContent className="p-5">
             <div className="flex items-center justify-between mb-3">
               <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20 group-hover:scale-110 transition-transform">
                 <AlertTriangle className="h-5 w-5 text-warning" />
               </div>
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-warning/80 uppercase tracking-widest">Parados +30d</p>
               <p className="text-3xl font-black tracking-tight text-warning">{safeKpis.itensParados30dias}</p>
             </div>
             <p className="text-[10px] font-bold text-muted-foreground/80 mt-4">R$ {(safeKpis.valorParado || 0).toLocaleString()}</p>
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