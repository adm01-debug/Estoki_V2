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

  const occupied = positions.filter((p) => p.status === "ocupada").length;
  const occupancyPercent = positions.length > 0 ? Math.round((occupied / positions.length) * 100) : 0;

    const isBoxes = ppName === "Boxes" || ppName === "Expedição" || ppName === "Sem PP";

    return (
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        layout
      >
        <Card className={cn(
          "overflow-hidden border-border/50 hover:border-primary/30 transition-colors",
          isBoxes && "bg-muted/5 border-dashed"
        )}>
          <CardHeader className="py-3 px-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-semibold">{ppName === "Sem PP" ? "Boxes de Expedição" : ppName}</span>
                <p className="text-[10px] text-muted-foreground font-normal">
                  {isBoxes 
                    ? `${positions.length} boxes ativos` 
                    : `${rackData.sortedSections.length} seções • ${rackData.sortedLevels.length} níveis`}
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-xs text-muted-foreground">Ocupação</p>
                <p className="text-sm font-bold text-foreground">{occupancyPercent}%</p>
              </div>
              <div className="w-16"><Progress value={occupancyPercent} className="h-1.5" /></div>
              <Badge variant="secondary" className="text-xs tabular-nums">{occupied}/{positions.length}</Badge>
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
                      <div key={niv} className="h-12 flex items-center justify-end">
                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{niv}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1 mb-1">
                      {rackData.sortedSections.map((sec) => (
                        <div key={sec} className="flex-1 min-w-[3rem] text-center">
                          <span className="text-[10px] font-medium text-muted-foreground">{sec}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-l-2 border-r-2 border-b-2 border-muted-foreground/20 rounded-b-md">
                      {rackData.sortedLevels.map((niv, nivIdx) => (
                        <div key={niv} className={cn("flex gap-[2px] p-[2px]", nivIdx < rackData.sortedLevels.length - 1 && "border-b border-muted-foreground/10")}>
                          {rackData.sortedSections.map((sec) => {
                            const pos = rackData.sections.get(sec)?.get(niv);
                            if (!pos) return <div key={`${sec}-${niv}`} className="flex-1 min-w-[3rem] h-12 rounded-sm bg-muted/30 border border-dashed border-muted-foreground/10" />;
                            const cfg = statusConfig[pos.status] || statusConfig.livre;
                            const isSelected = selectedId === pos.id;
                            const heatStyle = (viewMode as string) === "heatmap" ? { backgroundColor: getHeatColor(cfg.heatValue) } : {};
                            return (
                              <Tooltip key={pos.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onSelect(pos)}
                                    aria-label={`Posição ${pos.codigo}, status ${cfg.label}`}
                                    className={cn(
                                      "flex-1 min-w-[3rem] h-12 rounded-sm border text-[10px] font-medium flex flex-col items-center justify-center gap-0.5 transition-all duration-150 hover:scale-[1.05] hover:shadow-md hover:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                      isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-lg scale-[1.05]" : "",
                                      cfg.bgClass
                                    )}
                                    style={heatStyle}
                                  >
                                    <span className="font-bold leading-none">{sec.replace("S", "")}</span>
                                    <span className="text-[8px] opacity-70">{cfg.label.substring(0, 3)}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs max-w-48">
                                  <div className="space-y-1">
                                    <p className="font-semibold">{pos.codigo}</p>
                                    <p>Status: <span className="font-medium">{cfg.label}</span></p>
                                    <p>Tipo: {pos.tipo}</p>
                                    {pos.zona && <p>Zona: {pos.zona}</p>}
                                    {pos.capacidade_kg && <p>Cap: {pos.capacidade_kg}kg</p>}
                                    <p className="text-[10px] text-muted-foreground pt-1">Clique para detalhes</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 h-1.5 bg-muted-foreground/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn(
              "grid gap-1.5",
              isBoxes 
                ? "grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16" 
                : "grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
            )}>
              <AnimatePresence mode="popLayout">
                {positions.map((pos) => {
                  const cfg = statusConfig[pos.status] || statusConfig.livre;
                  const isSelected = selectedId === pos.id;
                  const heatStyle = viewMode === "heatmap" ? { backgroundColor: getHeatColor(cfg.heatValue) } : {};
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
                            "aspect-square rounded-md border text-[9px] font-medium flex flex-col items-center justify-center transition-all duration-150 hover:scale-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                            cfg.bgClass,
                            isBoxes && "aspect-video h-auto py-2"
                          )}
                          style={heatStyle}
                        >
                          {isBoxes ? (
                            <>
                              <span className="text-[10px] font-bold">{pos.box || pos.codigo.split('-').pop()}</span>
                              <span className="text-[7px] opacity-70 uppercase">BOX</span>
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
              {positions.map((pos) => {
                const cfg = statusConfig[pos.status] || statusConfig.livre;
                const isSelected = selectedId === pos.id;
                const heatStyle = viewMode === "heatmap" ? { backgroundColor: getHeatColor(cfg.heatValue) } : {};
                return (
                  <Tooltip key={pos.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelect(pos)}
                        aria-label={`Posição ${pos.codigo}, status ${cfg.label}`}
                        className={cn(
                          "aspect-square rounded-md border text-[9px] font-medium flex items-center justify-center transition-all duration-150 hover:scale-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                          cfg.bgClass
                        )}
                        style={heatStyle}
                      >
                        {pos.nivel || pos.codigo.slice(-2)}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold">{pos.codigo}</p>
                      <p>Status: {cfg.label}</p>
                      {pos.zona && <p>Zona: {pos.zona}</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
