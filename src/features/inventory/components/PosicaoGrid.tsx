 import { PosicaoCard } from "./PosicaoCard";
 import { motion, AnimatePresence } from "framer-motion";
 import { ListSkeleton } from "@/components/ui/loading-skeleton";
 
 interface Posicao { 
   id: string; 
   codigo: string; 
   status: string; 
   tipo: string; 
   ocupacao?: number; 
 }

interface PosicaoGridProps {
  posicoes: Posicao[];
  onSelect?: (posicao: Posicao) => void;
  loading?: boolean;
}

 export function PosicaoGrid({ posicoes, onSelect, loading }: PosicaoGridProps) {
   if (loading) {
     return (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
         {[...Array(12)].map((_, i) => (
           <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl border border-border/50" />
         ))}
       </div>
     );
   }
 
   if (!posicoes || posicoes.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/5">
         <p>Nenhuma posição encontrada</p>
       </div>
     );
   }
 
   return (
     <motion.div 
       layout
       className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
     >
       <AnimatePresence mode="popLayout">
         {posicoes.map((posicao) => (
           <motion.div
             key={posicao.id}
             layout
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             transition={{ duration: 0.2 }}
           >
             <PosicaoCard 
               {...posicao} 
               onClick={() => onSelect?.(posicao)} 
             />
           </motion.div>
         ))}
       </AnimatePresence>
     </motion.div>
   );
 }
