 import { memo, useState } from "react";
 import { Card, CardContent } from "@/components/ui/card";
 import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
 import { Package, Info, MapPin, Layers } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { motion, useReducedMotion } from "framer-motion";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Progress } from "@/components/ui/progress";
 import { Separator } from "@/components/ui/separator";
 import { Badge } from "@/components/ui/badge";
 
 interface Posicao {
   id?: string;
   codigo: string;
   status: string;
   tipo: string;
   ocupacao?: number;
 }
 
 interface PosicaoCardProps {
   codigo: string;
   status: string;
   tipo: string;
   ocupacao?: number;
   onClick?: () => void;
 }
 
 export const PosicaoCard = memo(function PosicaoCard({ codigo, status, tipo, ocupacao = 0, onClick }: PosicaoCardProps) {
   const [showDetails, setShowDetails] = useState(false);
   const shouldReduceMotion = useReducedMotion();
 
   const handleCardClick = () => {
     setShowDetails(true);
     if (onClick) onClick();
   };
 
   const variants = {
     initial: { width: 0 },
     animate: { width: `${ocupacao}%` }
   };
 
   return (
     <>
       <Card 
         className={cn(
           "group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/40 hover:border-primary/50 bg-card/50 backdrop-blur-sm relative overflow-hidden",
           "active:scale-[0.98]"
         )} 
         onClick={handleCardClick}
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
                 initial={shouldReduceMotion ? false : "initial"}
                 animate={shouldReduceMotion ? false : "animate"}
                 variants={variants}
                 style={shouldReduceMotion ? { width: `${ocupacao}%` } : {}}
                 transition={{ duration: 1, ease: "easeOut" }}
               />
             </div>
           </div>
         </CardContent>
       </Card>
 
       <Dialog open={showDetails} onOpenChange={setShowDetails}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Info className="h-5 w-5 text-primary" />
               Detalhes da Posição
             </DialogTitle>
           </DialogHeader>
           
           <div className="space-y-6 py-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Código</p>
                 <div className="flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-muted-foreground" />
                   <span className="font-mono font-bold text-lg">{codigo}</span>
                 </div>
               </div>
               <div className="space-y-1">
                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                 <StatusBadge variant={getStatusVariant(status)} size="md" dot>{status}</StatusBadge>
               </div>
             </div>
 
             <Separator />
 
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tipo</p>
                 <div className="flex items-center gap-2">
                   <Layers className="h-4 w-4 text-muted-foreground" />
                   <span className="font-semibold">{tipo}</span>
                 </div>
               </div>
               <div className="space-y-1">
                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ocupação Atual</p>
                 <Badge variant={ocupacao > 90 ? "destructive" : "secondary"} className="font-bold">
                   {ocupacao}%
                 </Badge>
               </div>
             </div>
 
             <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Progresso de Ocupação</span>
                 <span className="font-medium">{ocupacao}%</span>
               </div>
               <Progress 
                 value={ocupacao} 
                 className={cn(
                   "h-2",
                   ocupacao > 90 ? "[&>div]:bg-destructive" : ocupacao > 70 ? "[&>div]:bg-warning" : "[&>div]:bg-primary"
                 )}
               />
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </>
   );
 });
