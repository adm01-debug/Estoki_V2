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
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cfg.bgClass)}>
              <Icon className="h-4 w-4" />
            </div>
            Posição {posicao.codigo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] uppercase text-muted-foreground font-medium">Status</p>
              <Badge className={cn("mt-1", cfg.bgClass)}>{cfg.label}</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] uppercase text-muted-foreground font-medium">Tipo</p>
              <p className="font-medium text-sm mt-1">{posicao.tipo}</p>
            </div>
            {posicao.zona && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Zona</p>
                <p className="font-medium text-sm mt-1">{posicao.zona}</p>
              </div>
            )}
            {posicao.capacidade_kg && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Capacidade</p>
                <p className="font-medium text-sm mt-1">{posicao.capacidade_kg} kg</p>
              </div>
            )}
            {posicao.porta_palete && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Porta-Palete</p>
                <p className="font-medium text-sm mt-1">{posicao.porta_palete}</p>
              </div>
            )}
            {posicao.nivel && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Nível</p>
                <p className="font-medium text-sm mt-1">{posicao.nivel}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Produtos Armazenados
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : !estoqueData?.length ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <Box className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Posição vazia</p>
              </div>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {estoqueData.map((item: Record<string, unknown>) => (
                    <div key={String(item.id)} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {String((item.produtos as Record<string, unknown> | null)?.nome ?? "Produto")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {String((item.produtos as Record<string, unknown> | null)?.sku ?? "—")}
                          {(item.lotes as Record<string, unknown> | null)?.numero_lote && ` • Lote: ${String((item.lotes as Record<string, unknown>).numero_lote)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{String(item.quantidade)}</p>
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
