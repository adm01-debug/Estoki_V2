import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PosicaoVisual, statusConfig } from "./types";

interface PosicaoDetalhePanelProps {
  posicao: PosicaoVisual | null;
  open: boolean;
  onClose: () => void;
}

export function PosicaoDetalhePanel({ posicao, open, onClose }: PosicaoDetalhePanelProps) {
  const { data: estoqueData, isLoading } = useQuery({
    queryKey: ["posicao-detalhe", posicao?.id],
    enabled: !!posicao?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_posicao")
        .select("*, produtos(nome, sku, peso_unitario), lotes(numero_lote, data_validade)")
        .eq("posicao_id", posicao!.id);
      if (error) throw error;
      return data;
    },
  });

  if (!posicao) return null;
  const cfg = statusConfig[posicao.status] || statusConfig.livre;
  const Icon = cfg.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cfg.bgClass)}>
              <Icon className="h-4 w-4" />
            </div>
            Posição {posicao.codigo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Status</p>
              <Badge className={cn("mt-1", cfg.bgClass)}>{cfg.label}</Badge>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Tipo</p>
              <p className="mt-1 text-sm font-medium">{posicao.tipo}</p>
            </div>
            {posicao.zona && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Zona</p>
                <p className="mt-1 text-sm font-medium">{posicao.zona}</p>
              </div>
            )}
            {posicao.capacidade_kg && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">
                  Capacidade
                </p>
                <p className="mt-1 text-sm font-medium">{posicao.capacidade_kg} kg</p>
              </div>
            )}
            {posicao.porta_palete && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">
                  Porta-Palete
                </p>
                <p className="mt-1 text-sm font-medium">{posicao.porta_palete}</p>
              </div>
            )}
            {posicao.nivel && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Nível</p>
                <p className="mt-1 text-sm font-medium">{posicao.nivel}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Produtos Armazenados
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : !estoqueData?.length ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                <Box className="mx-auto mb-2 h-8 w-8 opacity-40" />
                <p>Posição vazia</p>
              </div>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {estoqueData.map((item: Record<string, unknown>) => (
                    <div
                      key={String(item.id)}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {String(
                            (item.produtos as Record<string, unknown> | null)?.nome ?? "Produto"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU:{" "}
                          {String((item.produtos as Record<string, unknown> | null)?.sku ?? "—")}
                          {(item.lotes as Record<string, unknown> | null)?.numero_lote
                            ? ` • Lote: ${String((item.lotes as Record<string, unknown>).numero_lote)}`
                            : null}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{String(item.quantidade)}</p>
                        <p className="text-[10px] text-muted-foreground">unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
