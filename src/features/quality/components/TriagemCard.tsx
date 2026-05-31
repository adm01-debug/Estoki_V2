import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { formatRelativeTime } from "@/utils/date";
import { FileSearch, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface TriagemCardProps { triagem: any; onClick?: () => void; }

export function TriagemCard({ triagem, onClick }: TriagemCardProps) {
   const shouldReduceMotion = useReducedMotion();
   const progresso = (triagem.quantidade_aprovada || 0) / triagem.quantidade_total * 100;
 
   return (
     <motion.div
       whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.01 }}
       transition={{ type: "spring", stiffness: 400, damping: 10 }}
     >
       <Card 
         className="cursor-pointer hover:shadow-lg transition-all border-border/40 hover:border-primary/40 bg-card/80 backdrop-blur-sm group overflow-hidden relative" 
         onClick={onClick}
       >
         <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
           <ArrowRight className="h-4 w-4 text-primary" />
         </div>
 
         <CardHeader className="pb-2">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm flex items-center gap-2 font-mono">
               <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                 <FileSearch className="h-3.5 w-3.5" />
               </div>
               Lote #{triagem.lote_id?.slice(0, 8)}
             </CardTitle>
             <StatusBadge variant={getStatusVariant(triagem.status)} size="sm" dot>
               {triagem.status}
             </StatusBadge>
           </div>
         </CardHeader>
         <CardContent className="space-y-3">
           <div className="space-y-1.5">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
               <span>Progresso da Triagem</span>
               <span className={cn(progresso === 100 ? "text-success" : "text-primary")}>
                 {Math.round(progresso)}%
               </span>
             </div>
             <Progress value={progresso} className="h-1.5" />
           </div>
 
           <div className="flex items-center justify-between mt-2">
             <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
               <Clock className="h-3 w-3" />
               {formatRelativeTime(triagem.created_at)}
             </div>
             <div className="flex items-center gap-2">
               <div className="flex items-center gap-1 text-[11px] font-medium text-success">
                 <CheckCircle2 className="h-3 w-3" />
                 {triagem.quantidade_aprovada || 0}
               </div>
               <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                 / {triagem.quantidade_total}
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }
