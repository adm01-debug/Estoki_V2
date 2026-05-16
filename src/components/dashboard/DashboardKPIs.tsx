  import { Card, CardContent } from "@/components/ui/card";
  import { cn } from "@/lib/utils";
 import { Progress } from "@/components/ui/progress";
  import { BarChart3, Package, TrendingUp, AlertTriangle, ClipboardList, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { memo } from "react";
import { DashboardKPIs as DashboardKPIsInterface } from "@/features/dashboard/hooks/useDashboard";

interface DashboardKPIsProps {
  kpis: DashboardKPIsInterface;
}

export const DashboardKPIs = memo(function DashboardKPIs({ kpis }: DashboardKPIsProps) {
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

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="glass-card border-blue-500/20 bg-blue-500/5 group hover:border-blue-500/40 transition-all duration-300">
           <CardContent className="p-5 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:rotate-12 transition-transform">
                 <ClipboardList className="h-6 w-6 text-blue-600" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Triagens Concluídas</p>
                 <p className="text-3xl font-black text-blue-700 leading-none mt-1">{safeKpis.triagensHoje}</p>
               </div>
             </div>
             <div className="text-right px-4 py-2 bg-white/40 dark:bg-black/20 rounded-xl border border-blue-500/10">
               <span className="text-[10px] font-bold text-muted-foreground uppercase block tracking-wider">Pendentes</span>
               <span className="text-lg font-black text-orange-600">{safeKpis.triagensPendentes}</span>
             </div>
           </CardContent>
         </Card>
         
         <Card className="glass-card border-success/20 bg-success/5 group hover:border-success/40 transition-all duration-300">
           <CardContent className="p-5 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center border border-success/20 group-hover:rotate-12 transition-transform">
                 <TrendingUp className="h-6 w-6 text-success" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-success uppercase tracking-widest">Fluxo Operacional</p>
                 <div className="flex gap-6 mt-1">
                   <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase block">Entradas</span>
                     <p className="text-2xl font-black text-success leading-none">{safeKpis.entradasHoje}</p>
                   </div>
                   <div className="w-px h-8 bg-border/40 my-auto" />
                   <div>
                     <span className="text-[9px] font-bold text-muted-foreground uppercase block">Saídas</span>
                     <p className="text-2xl font-black text-destructive leading-none">{safeKpis.saidasHoje}</p>
                   </div>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
   </div>
    );
  });