import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, MousePointer2 } from "lucide-react";

interface Position {
  id: string;
  codigo: string;
  zona: string;
  corredor: string;
  coluna: number;
  nivel: number;
  status: "livre" | "ocupado" | "reservado" | "bloqueado";
  ocupacao: number; // 0-100
}

interface WarehouseMapProps {
  positions: Position[];
  onPositionClick?: (pos: Position) => void;
}

export function WarehouseMap({ positions, onPositionClick }: WarehouseMapProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const zones = Array.from(new Set(positions.map((p) => p.zona)));
  const [selectedZone, setSelectedZone] = useState(zones[0] || "");

  const filteredPositions = positions.filter((p) => p.zona === selectedZone);
  const corridors = Array.from(new Set(filteredPositions.map((p) => p.corredor))).sort();
  const maxLevel = Math.max(...filteredPositions.map((p) => p.nivel), 1);

  const getStatusColor = (status: string, ocupacao: number) => {
    if (status === "bloqueado") return "bg-destructive/50 border-destructive";
    if (status === "reservado") return "bg-amber-500/50 border-amber-500";
    if (ocupacao === 0)
      return "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
    if (ocupacao < 50) return "bg-success/30 border-success/50";
    if (ocupacao < 90) return "bg-success/60 border-success";
    return "bg-success border-success-foreground/20";
  };

  return (
    <Card
      className={cn(
        "w-full overflow-hidden border-primary/10 bg-background/50 backdrop-blur-sm transition-all duration-500",
        isMaximized ? "fixed inset-4 z-50 h-[calc(100vh-32px)]" : "relative"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Layout do Armazém 3D
        </CardTitle>
        <div className="flex gap-2">
          <div className="mr-2 flex rounded-lg bg-muted/30 p-1">
            {zones.map((zone) => (
              <Badge
                key={zone}
                variant={selectedZone === zone ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedZone(zone)}
              >
                Zona {zone}
              </Badge>
            ))}
          </div>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </CardHeader>
      <CardContent className={cn("p-6", isMaximized ? "h-[calc(100%-80px)] overflow-y-auto" : "")}>
        <div className="scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent overflow-x-auto pb-6">
          <div className="flex min-w-max gap-8">
            {corridors.map((corridor) => (
              <div key={corridor} className="space-y-4">
                <h4 className="rounded bg-muted/20 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Cor {corridor}
                </h4>
                <div className="grid gap-1.5">
                  {Array.from({ length: maxLevel }, (_, i) => maxLevel - i).map((level) => (
                    <div key={level} className="flex gap-1">
                      {filteredPositions
                        .filter((p) => p.corredor === corridor && p.nivel === level)
                        .sort((a, b) => a.coluna - b.coluna)
                        .map((pos) => (
                          <TooltipProvider key={pos.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: 1.2, zIndex: 10, rotate: 2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onPositionClick?.(pos)}
                                  className={cn(
                                    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border-2 text-[10px] font-black shadow-sm transition-all",
                                    getStatusColor(pos.status, pos.ocupacao)
                                  )}
                                >
                                  {pos.nivel}-{pos.coluna}
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="min-w-[120px] space-y-2 p-1">
                                  <div className="flex items-center justify-between border-b border-primary/10 pb-1">
                                    <p className="font-black text-primary">{pos.codigo}</p>
                                    <Badge variant="outline" className="h-4 text-[8px] uppercase">
                                      {pos.status}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-muted-foreground">Ocupação:</span>
                                      <span className="font-bold">{pos.ocupacao}%</span>
                                    </div>
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                      <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${pos.ocupacao}%` }}
                                      />
                                    </div>
                                  </div>
                                  <p className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                    <MousePointer2 className="h-2 w-2" /> Clique para gerenciar
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t pt-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-slate-200 bg-slate-100" /> Vazia
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-success/50 bg-success/30" /> Ocupação
            Baixa
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-success-foreground/20 bg-success" />{" "}
            Ocupação Alta
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-amber-500 bg-amber-500/50" /> Reservada
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-destructive bg-destructive/50" />{" "}
            Bloqueada
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
