 import { Clock, CheckCircle, AlertTriangle, TrendingUp, Filter } from "lucide-react";
 import { Card, CardContent } from "@/components/ui/card";
 import { cn } from "@/lib/utils";

interface TriagemStatsCardsProps {
  stats: {
    emAndamento: number;
    aprovados: number;
    reprovados: number;
  };
}

 export function TriagemStatsCards({ stats }: TriagemStatsCardsProps) {
   return (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <Card className="glass-card border-primary/20 bg-primary/5 group hover:border-primary/40 transition-all duration-300">
         <CardContent className="p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:rotate-12 transition-transform">
             <Clock className="h-6 w-6 text-primary" />
           </div>
           <div>
             <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Em Andamento</p>
             <p className="text-2xl font-black text-primary tracking-tight">{stats.emAndamento}</p>
           </div>
         </CardContent>
       </Card>
 
       <Card className="glass-card border-success/20 bg-success/5 group hover:border-success/40 transition-all duration-300">
         <CardContent className="p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center border border-success/20 group-hover:rotate-12 transition-transform">
             <CheckCircle className="h-6 w-6 text-success" />
           </div>
           <div>
             <p className="text-[10px] font-bold text-success/60 uppercase tracking-widest">Aprovados</p>
             <p className="text-2xl font-black text-success tracking-tight">{stats.aprovados}</p>
           </div>
         </CardContent>
       </Card>
 
       <Card className="glass-card border-destructive/20 bg-destructive/5 group hover:border-destructive/40 transition-all duration-300">
         <CardContent className="p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 group-hover:rotate-12 transition-transform">
             <AlertTriangle className="h-6 w-6 text-destructive" />
           </div>
           <div>
             <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-widest">Reprovados</p>
             <p className="text-2xl font-black text-destructive tracking-tight">{stats.reprovados}</p>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }
