import { useState } from "react";
import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
  Flame,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PosicaoEstoque, StatusPosicao } from "../hooks/useEstoque";
import { differenceInDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Package, Calendar, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<StatusPosicao, { bg: string; border: string; label: string }> = {
  livre: { bg: "bg-muted/50", border: "border-dashed border-border", label: "Livre" },
  ocupado: { bg: "bg-success/20", border: "border-success", label: "Ocupado" },
  reservado: { bg: "bg-warning/20", border: "border-warning", label: "Reservado" },
  bloqueado: { bg: "bg-destructive/20", border: "border-destructive", label: "Bloqueado" },
};

interface EstoqueMapaTabProps {
  filteredPositions: PosicaoEstoque[];
  ruas: string[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onSelectPosition: (pos: PosicaoEstoque) => void;
}

export const EstoqueMapaTab = memo(
  ({ filteredPositions, ruas, zoom, onZoomChange, onSelectPosition }: EstoqueMapaTabProps) => {
    const [heatmapEnabled, setHeatmapEnabled] = useState(false);

    const getDiasArmazenado = (pos: PosicaoEstoque): number => {
      if (!pos.created_at) return 0;
      return differenceInDays(new Date(), new Date(pos.created_at));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
              onClick={() => {
                const suggested =
                  ruas.length > 0 ? `Rua ${ruas[0]}, Nível 1` : "em posições livres da Zona A";
                toast.success(`IA: Melhores posições sugeridas para recebimento: ${suggested}.`, {
                  icon: <Sparkles className="h-4 w-4 text-primary" />,
                });
              }}
            >
              <Sparkles className="h-4 w-4" /> Sugestão IA
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-sm text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onZoomChange(1)}
              title="Reset Zoom"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant={heatmapEnabled ? "default" : "outline"}
              size="sm"
              className="ml-2 gap-2"
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            >
              <Flame className={cn("h-4 w-4", heatmapEnabled && "animate-pulse")} />
              <span className="hidden sm:inline">Heatmap</span>
            </Button>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredPositions.length} posições
          </Badge>
        </div>

        <div className="overflow-auto pb-4">
          <TooltipProvider>
            <div
              className="grid min-w-[600px] grid-cols-1 gap-4 transition-transform md:grid-cols-2"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            >
              {ruas.map((rua) => {
                const ruaPositions = filteredPositions.filter((p) => p.porta_palete === rua);
                if (ruaPositions.length === 0) return null;

                const ruaNiveis = [...new Set(ruaPositions.map((p) => p.nivel).filter(Boolean))]
                  .sort()
                  .reverse();
                const ruaSecoes = [
                  ...new Set(ruaPositions.map((p) => p.secao).filter(Boolean)),
                ].sort((a, b) => parseInt(a!) - parseInt(b!));

                return (
                  <div key={rua}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            PP {rua}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {ruaPositions.filter((p) => p.status === "ocupado").length}/
                            {ruaPositions.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-1">
                          {ruaNiveis.map((nivel) => (
                            <div key={nivel} className="flex items-center gap-2">
                              <span className="w-6 text-xs font-medium text-muted-foreground">
                                N{nivel}
                              </span>
                              <div
                                className="grid flex-1 gap-1"
                                style={{
                                  gridTemplateColumns: `repeat(${Math.min(ruaSecoes.length, 10)}, 1fr)`,
                                }}
                              >
                                {ruaSecoes.slice(0, 10).map((secao) => {
                                  const position = ruaPositions.find(
                                    (p) => p.nivel === nivel && p.secao === secao
                                  );
                                  if (!position)
                                    return <div key={secao} className="h-8 rounded bg-muted/30" />;
                                  const config = statusConfig[position.status];
                                  const diasArmazenado = getDiasArmazenado(position);

                                  let heatmapStyle = {};
                                  if (heatmapEnabled && position.status === "ocupado") {
                                    if (diasArmazenado > 60)
                                      heatmapStyle = {
                                        backgroundColor: "#ef4444",
                                        color: "white",
                                        borderColor: "#b91c1c",
                                      };
                                    // Red
                                    else if (diasArmazenado > 30)
                                      heatmapStyle = {
                                        backgroundColor: "#f97316",
                                        color: "white",
                                        borderColor: "#c2410c",
                                      };
                                    // Orange
                                    else if (diasArmazenado > 15)
                                      heatmapStyle = {
                                        backgroundColor: "#eab308",
                                        color: "white",
                                        borderColor: "#a16207",
                                      };
                                    // Yellow
                                    else
                                      heatmapStyle = {
                                        backgroundColor: "#22c55e",
                                        color: "white",
                                        borderColor: "#15803d",
                                      }; // Green
                                  }
                                  return (
                                    <Tooltip key={position.id}>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => onSelectPosition(position)}
                                          className={cn(
                                            "group relative z-0 flex h-8 items-center justify-center rounded-md border-2 text-[10px] font-medium transition-all hover:z-10 hover:scale-110 active:scale-95",
                                            !heatmapEnabled && config.bg,
                                            !heatmapEnabled && config.border,
                                            "hover:ring-2 hover:ring-primary hover:ring-offset-1",
                                            position.status === "livre" && "hover:bg-success/10",
                                            position.status === "bloqueado" &&
                                              "cursor-not-allowed opacity-60"
                                          )}
                                          style={heatmapStyle}
                                          title={`${position.codigo} - ${config.label}`}
                                        >
                                          {position.status === "ocupado" && (
                                            <div className="flex flex-col items-center">
                                              {diasArmazenado > 30 ? (
                                                <Clock className="h-3 w-3 animate-pulse text-warning" />
                                              ) : (
                                                <Package className="h-3 w-3 opacity-60" />
                                              )}
                                            </div>
                                          )}
                                          {position.status === "livre" && (
                                            <CheckCircle2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
                                          )}
                                          {position.status === "bloqueado" && (
                                            <XCircle className="h-3 w-3 text-destructive" />
                                          )}
                                          {position.status === "reservado" && (
                                            <Clock className="h-3 w-3 text-warning" />
                                          )}
                                          <span className="absolute bottom-0 right-0.5 text-[7px] opacity-40 transition-opacity group-hover:opacity-100">
                                            {secao}
                                          </span>
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="w-64 p-3">
                                        <div className="space-y-2">
                                          <div className="border-bottom mb-1 flex items-center justify-between pb-1">
                                            <span className="text-sm font-bold">
                                              {position.codigo}
                                            </span>
                                            <Badge
                                              variant={
                                                position.status === "livre"
                                                  ? "secondary"
                                                  : "default"
                                              }
                                              className="text-[10px]"
                                            >
                                              {statusConfig[position.status].label}
                                            </Badge>
                                          </div>

                                          {position.saldos && position.saldos.length > 0 ? (
                                            <div className="space-y-1.5">
                                              {position.saldos.map((s: any, i: number) => (
                                                <div
                                                  key={i}
                                                  className="rounded bg-muted/50 p-1.5 text-xs"
                                                >
                                                  <div className="flex items-center gap-1 truncate font-medium">
                                                    <Package className="h-3 w-3" />{" "}
                                                    {s.produto?.nome}
                                                  </div>
                                                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                                                    <span>SKU: {s.produto?.sku}</span>
                                                    <span>Qtd: {s.quantidade}</span>
                                                  </div>
                                                </div>
                                              ))}
                                              <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Calendar className="h-3 w-3" /> Armazenado há{" "}
                                                {diasArmazenado} dias
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-xs text-muted-foreground">
                                              Posição vazia
                                            </p>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="w-6" />
                            <div
                              className="grid flex-1 gap-1"
                              style={{
                                gridTemplateColumns: `repeat(${Math.min(ruaSecoes.length, 10)}, 1fr)`,
                              }}
                            >
                              {ruaSecoes.slice(0, 10).map((secao) => (
                                <span
                                  key={secao}
                                  className="text-center text-[10px] text-muted-foreground"
                                >
                                  {secao}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
        </div>

        <div className="flex flex-wrap justify-center gap-4 border-t py-2">
          {(
            Object.entries(statusConfig) as [StatusPosicao, (typeof statusConfig)[StatusPosicao]][]
          ).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("h-4 w-4 rounded border-2", config.bg, config.border)} />
              <span className="text-sm text-muted-foreground">{config.label}</span>
            </div>
          ))}
          <AnimatePresence>
            {heatmapEnabled ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-4 rounded-lg bg-muted/30 p-2"
              >
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  <span className="text-[10px]">Recente</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#eab308]" />
                  <span className="text-[10px]">+15d</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#f97316]" />
                  <span className="text-[10px]">+30d</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="text-[10px]">+60d</span>
                </div>
                <Info className="ml-2 h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Idade do Estoque</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
                <span className="text-sm text-muted-foreground">+30 dias</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

EstoqueMapaTab.displayName = "EstoqueMapaTab";
