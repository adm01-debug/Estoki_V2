import { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, MapPin, Package, AlertTriangle, Clock, Loader2, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import type { PosicaoEstoque } from "@/types/inventory";
import { usePosicaoDetalhes } from "../hooks/usePosicaoDetalhes";
import {
  EstoquePosicaoDetalhes,
  ProdutoDetalhes,
  LoteDetalhes,
  statusConfig,
} from "./posicao-detalhes/types";
import { PosicaoInfoCard } from "./posicao-detalhes/PosicaoInfoCard";
import { ProdutoInfoCard } from "./posicao-detalhes/ProdutoInfoCard";
import { LoteInfoCard } from "./posicao-detalhes/LoteInfoCard";
import { PosicaoActions } from "./posicao-detalhes/PosicaoActions";

interface PosicaoDetalhesDialogProps {
  position: PosicaoEstoque | null;
  onClose: () => void;
}

export function PosicaoDetalhesDialog({ position, onClose }: PosicaoDetalhesDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const { detalhes, loading, history, loadingHistory } = usePosicaoDetalhes(position);

  if (!position) return null;

  const diasArmazenado = detalhes?.data_entrada
    ? differenceInDays(new Date(), new Date(detalhes.data_entrada))
    : 0;
  const diasParaVencer = detalhes?.lote?.data_validade
    ? differenceInDays(new Date(detalhes.lote.data_validade), new Date())
    : null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-card sm:max-w-lg sm:rounded-2xl"
          initial={shouldReduceMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0.1 } : { type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 flex items-center justify-between border-b bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{position.codigo}</h3>
                <Badge
                  className={cn(
                    "mt-1",
                    statusConfig[position.status].bg,
                    statusConfig[position.status].color
                  )}
                >
                  {statusConfig[position.status].icon} {statusConfig[position.status].label}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4 p-4">
            <PosicaoInfoCard position={position} />

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && detalhes?.produto && (
              <ProdutoInfoCard detalhes={detalhes} diasArmazenado={diasArmazenado} />
            )}
            {!loading && detalhes?.lote && (
              <LoteInfoCard lote={detalhes.lote} diasParaVencer={diasParaVencer} />
            )}

            {position.status === "livre" && (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>Posição disponível para armazenamento</p>
              </div>
            )}
            {position.status === "reservado" && (
              <div className="py-8 text-center text-warning">
                <Clock className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>Posição reservado para recebimento</p>
              </div>
            )}
            {position.status === "bloqueado" && (
              <div className="py-8 text-center text-destructive">
                <AlertTriangle className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>Posição bloqueado para uso</p>
              </div>
            )}

            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Últimas Alterações
                </span>
              </div>
              <div className="space-y-3">
                {loadingHistory ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground">Sem registros recentes</p>
                ) : (
                  history.map((log) => (
                    <div key={log.id} className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {statusConfig[log.status_novo as keyof typeof statusConfig]?.label ||
                            log.status_novo}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <User className="h-2 w-2" /> {log.profiles?.nome || "Sistema"}
                        </span>
                      </div>
                      <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <PosicaoActions position={position} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
