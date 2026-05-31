import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowUpRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Info } from "lucide-react";

interface Props {
  loading: boolean;
  ocupacaoPP: number;
  ocupacaoBoxes: number;
  posicoesOcupadas: number;
  posicoesLivres: number;
}

export const IndexOcupacaoCard = memo(function IndexOcupacaoCard({
  loading,
  ocupacaoPP,
  ocupacaoBoxes,
  posicoesOcupadas,
  posicoesLivres,
}: Props) {
  const navigate = useNavigate();

  return (
    <Card className="glass-card group col-span-1 border-border/30 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Status de Ocupação
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
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
              <motion.div
                className="text-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
              >
                <ProgressRing
                  value={ocupacaoPP}
                  variant={ocupacaoPP > 90 ? "danger" : ocupacaoPP > 70 ? "warning" : "success"}
                  label="Porta-Paletes"
                  size={130}
                  strokeWidth={12}
                />
              </motion.div>
              <div className="h-24 w-px bg-border/30" />
              <motion.div
                className="text-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
              >
                <ProgressRing
                  value={ocupacaoBoxes}
                  variant={
                    ocupacaoBoxes > 90 ? "danger" : ocupacaoBoxes > 70 ? "warning" : "success"
                  }
                  label="Boxes"
                  size={130}
                  strokeWidth={12}
                />
              </motion.div>
            </div>
            <TooltipProvider>
              <div className="flex flex-col gap-3 border-t border-border/30 pt-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span>{posicoesOcupadas} Posições Ocupadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span>{posicoesLivres} Livres</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Activity className="h-4 w-4 animate-pulse text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Status da Operação
                      </p>
                      <p className="text-xs font-black text-foreground">Fluxo Estabilizado</p>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="cursor-help border-success/20 bg-success/10 text-[9px] font-black uppercase text-success"
                      >
                        Otimizado <Info className="ml-1 h-2 w-2" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">
                        Ocupação balanceada entre zonas críticas detectada pela IA.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </>
        )}
      </CardContent>
    </Card>
  );
});
