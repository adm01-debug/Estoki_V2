import { memo } from "react";
import { motion } from "framer-motion";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Skeleton } from "@/components/ui/skeleton";
 import { TrendingUp, ArrowUpRight, Maximize2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useNavigate } from "react-router-dom";
import { ProgressRing } from "@/components/dashboard/ProgressRing";

interface Props {
  loading: boolean;
  ocupacaoPP: number;
  ocupacaoBoxes: number;
  posicoesOcupadas: number;
  posicoesLivres: number;
}

export const IndexOcupacaoCard = memo(function IndexOcupacaoCard({ loading, ocupacaoPP, ocupacaoBoxes, posicoesOcupadas, posicoesLivres }: Props) {
   const navigate = useNavigate();
 
   return (
     <Card className="col-span-1 lg:col-span-2 glass-card border-border/30 group">
       <CardHeader className="pb-2 flex flex-row items-center justify-between">
         <CardTitle className="text-base font-bold flex items-center gap-2">
           <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
             <TrendingUp className="h-4 w-4 text-primary" />
           </div>
           Status de Ocupação
         </CardTitle>
         <Button 
           variant="ghost" 
           size="sm" 
           className="h-8 text-[10px] uppercase font-bold tracking-widest gap-2 text-primary hover:bg-primary/5"
           onClick={() => navigate("/ocupacao")}
         >
           Mapa Visual <ArrowUpRight className="h-3 w-3" />
         </Button>
       </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-around py-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-around py-6">
              <motion.div className="text-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3, type: "spring" }}>
                <ProgressRing value={ocupacaoPP} variant={ocupacaoPP > 90 ? "danger" : ocupacaoPP > 70 ? "warning" : "success"} label="Porta-Paletes" size={130} strokeWidth={12} />
              </motion.div>
              <div className="h-24 w-px bg-border/30" />
              <motion.div className="text-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4, type: "spring" }}>
                <ProgressRing value={ocupacaoBoxes} variant={ocupacaoBoxes > 90 ? "danger" : ocupacaoBoxes > 70 ? "warning" : "success"} label="Boxes" size={130} strokeWidth={12} />
              </motion.div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground pt-3 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span>{posicoesOcupadas} ocupados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <span>{posicoesLivres} livres</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
