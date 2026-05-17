import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
 import { Package, Box, Clock, TrendingUp, Info } from "lucide-react";
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProgressRing } from "@/components/dashboard/ProgressRing";

interface EstoqueStats {
  ppStats: { ocupados: number; livres: number; reservados: number; bloqueados: number; total: number };
  boxStats: { ocupados: number; livres: number; total: number };
  ocupacaoTotal: number;
}

interface EstoqueStatsCardsProps {
  stats: EstoqueStats;
}

export function EstoqueStatsCards({ stats }: EstoqueStatsCardsProps) {
  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="col-span-2 lg:col-span-1">
        <CardContent className="p-4 flex items-center gap-4">
          <ProgressRing
            value={stats.ocupacaoTotal} size={70} strokeWidth={6}
            variant={stats.ocupacaoTotal > 90 ? "danger" : stats.ocupacaoTotal > 70 ? "warning" : "success"}
          />
           <div className="flex flex-col">
             <div className="flex items-center gap-1.5">
               <p className="text-2xl font-bold tracking-tight">{stats.ocupacaoTotal}%</p>
               <TrendingUp className="h-4 w-4 text-success animate-pulse" />
             </div>
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <div className="flex items-center gap-1 cursor-help">
                     <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ocupação Total</p>
                     <Info className="h-3 w-3 text-muted-foreground/50" />
                   </div>
                 </TooltipTrigger>
                 <TooltipContent side="bottom" className="text-xs">
                   <p>Percentual de posições ocupadas em relação ao total disponível (PP + Box).</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
           </div>
        </CardContent>
      </Card>
       <Card className="overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
         </div>
         <CardContent className="p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center ring-1 ring-success/20">
               <Package className="h-5 w-5 text-success" />
             </div>
             <div className="flex flex-col">
               <p className="text-2xl font-bold text-success tracking-tight">
                 {stats.ppStats.ocupados + stats.boxStats.ocupados}
               </p>
               <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Ocupadas</p>
             </div>
           </div>
         </CardContent>
       </Card>
       <Card className="overflow-hidden relative group">
         <CardContent className="p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center ring-1 ring-border">
               <Box className="h-5 w-5 text-muted-foreground" />
             </div>
             <div className="flex flex-col">
               <p className="text-2xl font-bold tracking-tight">
                 {stats.ppStats.livres + stats.boxStats.livres}
               </p>
               <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Livres</p>
             </div>
           </div>
         </CardContent>
       </Card>
       <Card className="overflow-hidden relative group">
         <CardContent className="p-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center ring-1 ring-warning/20">
               <Clock className="h-5 w-5 text-warning" />
             </div>
             <div className="flex flex-col">
               <p className="text-2xl font-bold text-warning tracking-tight">
                 {stats.ppStats.reservados}
               </p>
               <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Reservadas</p>
             </div>
           </div>
         </CardContent>
       </Card>
    </motion.div>
  );
}
