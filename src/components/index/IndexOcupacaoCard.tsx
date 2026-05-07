import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { cn } from "@/lib/utils";

interface Props {
  loading: boolean;
  ocupacaoPP: number;
  ocupacaoBoxes: number;
  posicoesOcupadas: number;
  posicoesLivres: number;
}

export function IndexOcupacaoCard({ loading, ocupacaoPP, ocupacaoBoxes, posicoesOcupadas, posicoesLivres }: Props) {
  return (
    <Card className="col-span-1 lg:col-span-2 premium-glass border-border/20 shadow-premium group">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-black flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span>Taxa de Ocupação</span>
            <span className="text-overline font-medium text-muted-foreground mt-0.5">Métricas de Capacidade</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-around py-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-around py-8 gap-8">
              <motion.div 
                className="text-center" 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProgressRing 
                  value={ocupacaoPP} 
                  variant={ocupacaoPP > 90 ? "danger" : ocupacaoPP > 70 ? "warning" : "success"} 
                  label="Porta-Paletes" 
                  size={140} 
                  strokeWidth={14} 
                />
              </motion.div>
              
              <div className="hidden sm:block h-28 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />
              
              <motion.div 
                className="text-center" 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProgressRing 
                  value={ocupacaoBoxes} 
                  variant={ocupacaoBoxes > 90 ? "danger" : ocupacaoBoxes > 70 ? "warning" : "success"} 
                  label="Área de Boxes" 
                  size={140} 
                  strokeWidth={14} 
                />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
              <div className="premium-glass bg-success/5 p-4 rounded-xl border-success/10 transition-all hover:bg-success/10">
                <p className="text-overline text-success mb-1">Status Ocupado</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground">{posicoesOcupadas}</span>
                  <span className="text-xs text-muted-foreground font-medium">posições</span>
                </div>
              </div>
              <div className="premium-glass bg-muted/5 p-4 rounded-xl border-border/10 transition-all hover:bg-muted/10">
                <p className="text-overline text-muted-foreground mb-1">Status Livre</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground">{posicoesLivres}</span>
                  <span className="text-xs text-muted-foreground font-medium">posições</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
