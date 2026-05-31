import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PosicaoVisual, ViewMode, statusConfig, getHeatColor } from "./types";

interface RackViewProps {
  ppName: string;
  positions: PosicaoVisual[];
  selectedId: string | null;
  viewMode: ViewMode;
  onSelect: (pos: PosicaoVisual) => void;
}

export function RackView({ ppName, positions, selectedId, viewMode, onSelect }: RackViewProps) {
  const rackData = useMemo(() => {
    const sections = new Map<string, Map<string, PosicaoVisual>>();
    const allSections = new Set<string>();
    const allLevels = new Set<string>();

    positions.forEach((p) => {
      const sec = p.secao || p.codigo.match(/S(\d+)/)?.[0] || "S01";
      const niv = p.nivel || p.codigo.match(/N(\d)/)?.[0] || "N1";
      allSections.add(sec);
      allLevels.add(niv);
      if (!sections.has(sec)) sections.set(sec, new Map());
      sections.get(sec)!.set(niv, p);
    });

    return {
      sections,
      sortedSections: Array.from(allSections).sort(),
      sortedLevels: Array.from(allLevels).sort().reverse(),
    };
  }, [positions]);

  const occupied = positions.filter((p) => p.status === "ocupado").length;
  const occupancyPercent =
    positions.length > 0 ? Math.round((occupied / positions.length) * 100) : 0;

  const isBoxes = ppName === "Boxes" || ppName === "Expedição" || ppName === "Sem PP";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card
        className={cn(
          "overflow-hidden border-border/50 transition-colors hover:border-primary/30",
          isBoxes && "border-dashed bg-muted/5"
        )}
      >
        <CardHeader className="bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-semibold">
                  {ppName === "Sem PP" ? "Boxes de Expedição" : ppName}
                </span>
                <p className="text-[10px] font-normal text-muted-foreground">
                  {isBoxes
                    ? `${positions.length} boxes ativos`
                    : `${rackData.sortedSections.length} seções • ${rackData.sortedLevels.length} níveis`}
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="mr-2 text-right">
                <p className="text-xs text-muted-foreground">Ocupação</p>
                <p className="text-sm font-bold text-foreground">{occupancyPercent}%</p>
              </div>
              <div className="w-16">
                <Progress value={occupancyPercent} className="h-1.5" />
              </div>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {occupied}/{positions.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {viewMode === "rack" && !isBoxes ? (
            <div className="overflow-x-auto">
              <div className="min-w-fit">
                <div className="flex gap-0">
                  <div className="flex flex-col gap-1 pr-2 pt-0">
                    {rackData.sortedLevels.map((niv) => (
                      <div key={niv} className="flex h-12 items-center justify-end">
                        <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                          {niv}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex gap-1">
                      {rackData.sortedSections.map((sec) => (
                        <div key={sec} className="min-w-[3rem] flex-1 text-center">
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {sec}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-b-md border-b-2 border-l-2 border-r-2 border-muted-foreground/20">
                      {rackData.sortedLevels.map((niv, nivIdx) => (
                        <div
                          key={niv}
                          className={cn(
                            "flex gap-[2px] p-[2px]",
                            nivIdx < rackData.sortedLevels.length - 1 &&
                              "border-b border-muted-foreground/10"
                          )}
                        >
                          {rackData.sortedSections.map((sec) => {
                            const pos = rackData.sections.get(sec)?.get(niv);
                            if (!pos)
                              return (
                                <div
                                  key={`${sec}-${niv}`}
                                  className="h-12 min-w-[3rem] flex-1 rounded-sm border border-dashed border-muted-foreground/10 bg-muted/30"
                                />
                              );
                            const cfg = statusConfig[pos.status] || statusConfig.livre;
                            const isSelected = selectedId === pos.id;
                            const heatStyle =
                              (viewMode as string) === "heatmap"
                                ? { backgroundColor: getHeatColor(cfg.heatValue) }
                                : {};
                            return (
                              <Tooltip key={pos.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onSelect(pos)}
                                    aria-label={`Posição ${pos.codigo}, status ${cfg.label}`}
                                    className={cn(
                                      "flex h-12 min-w-[3rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-sm border text-[10px] font-medium transition-all duration-150 hover:z-10 hover:scale-[1.05] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                      isSelected
                                        ? "scale-[1.05] shadow-lg ring-2 ring-primary ring-offset-1 ring-offset-background"
                                        : "",
                                      cfg.bgClass
                                    )}
                                    style={heatStyle}
                                  >
                                    <span className="font-bold leading-none">
                                      {sec.replace("S", "")}
                                    </span>
                                    <span className="text-[8px] opacity-70">
                                      {cfg.label.substring(0, 3)}
                                    </span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-48 text-xs">
                                  <div className="space-y-1">
                                    <p className="font-semibold">{pos.codigo}</p>
                                    <p>
                                      Status: <span className="font-medium">{cfg.label}</span>
                                    </p>
                                    <p>Tipo: {pos.tipo}</p>
                                    {pos.zona && <p>Zona: {pos.zona}</p>}
                                    {pos.capacidade_kg && <p>Cap: {pos.capacidade_kg}kg</p>}
                                    <p className="pt-1 text-[10px] text-muted-foreground">
                                      Clique para detalhes
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted-foreground/20" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-1.5",
                isBoxes
                  ? "lg:grid-cols-16 grid-cols-4 sm:grid-cols-8 md:grid-cols-12"
                  : "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
              )}
            >
              <AnimatePresence mode="popLayout">
                {positions.map((pos) => {
                  const cfg = statusConfig[pos.status] || statusConfig.livre;
                  const isSelected = selectedId === pos.id;
                  const heatStyle =
                    viewMode === "heatmap" ? { backgroundColor: getHeatColor(cfg.heatValue) } : {};
                  return (
                    <Tooltip key={pos.id}>
                      <TooltipTrigger asChild>
                        <motion.button
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => onSelect(pos)}
                          aria-label={`Posição ${pos.codigo}, status ${cfg.label}`}
                          className={cn(
                            "flex aspect-square flex-col items-center justify-center rounded-md border text-[9px] font-medium transition-all duration-150 hover:scale-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected &&
                              "ring-2 ring-primary ring-offset-1 ring-offset-background",
                            cfg.bgClass,
                            isBoxes && "aspect-video h-auto py-2"
                          )}
                          style={heatStyle}
                        >
                          {isBoxes ? (
                            <>
                              <span className="text-[10px] font-bold">
                                {pos.box || pos.codigo.split("-").pop()}
                              </span>
                              <span className="text-[7px] uppercase opacity-70">BOX</span>
                            </>
                          ) : (
                            pos.nivel || pos.codigo.slice(-2)
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{pos.codigo}</p>
                        <p>Status: {cfg.label}</p>
                        {pos.zona && <p>Zona: {pos.zona}</p>}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
