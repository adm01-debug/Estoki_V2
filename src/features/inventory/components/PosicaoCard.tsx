import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
 import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
 import { Package } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { motion } from "framer-motion";
 
 interface PosicaoCardProps {
   codigo: string;
   status: string;
   tipo: string;
   ocupacao?: number;
   onClick?: () => void;
 }
 
 export const PosicaoCard = memo(function PosicaoCard({ codigo, status, tipo, ocupacao, onClick }: PosicaoCardProps) {
   return (
     <Card 
       className={cn(
         "group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/40 hover:border-primary/50 bg-card/50 backdrop-blur-sm relative overflow-hidden",
         onClick && "active:scale-[0.98]"
       )} 
       onClick={onClick}
     >
       <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
       <CardContent className="p-4 relative">
         <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
               <Package className="h-4 w-4" />
             </div>
             <span className="font-mono font-bold tracking-tight text-sm">{codigo}</span>
           </div>
           <StatusBadge variant={getStatusVariant(status)} size="sm" dot>{status}</StatusBadge>
         </div>
         <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-2">{tipo}</p>
         {ocupacao !== undefined && (
           <div className="space-y-1.5">
             <div className="flex justify-between items-center text-[10px]">
               <span className="text-muted-foreground font-medium">Ocupação</span>
               <span className="font-bold text-primary">{ocupacao}%</span>
             </div>
             <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
               <motion.div 
                 className={cn(
                   "h-full rounded-full",
                   ocupacao > 90 ? "bg-destructive" : ocupacao > 70 ? "bg-warning" : "bg-primary"
                 )}
                 initial={{ width: 0 }}
                 animate={{ width: `${ocupacao}%` }}
                 transition={{ duration: 1, ease: "easeOut" }}
               />
             </div>
           </div>
         )}
       </CardContent>
     </Card>
   );
 });
