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
  const zones = Array.from(new Set(positions.map(p => p.zona)));
  const [selectedZone, setSelectedZone] = useState(zones[0] || "");

  const filteredPositions = positions.filter(p => p.zona === selectedZone);
  const corridors = Array.from(new Set(filteredPositions.map(p => p.corredor))).sort();
  const maxLevel = Math.max(...filteredPositions.map(p => p.nivel), 1);

  const getStatusColor = (status: string, ocupacao: number) => {
    if (status === "bloqueado") return "bg-destructive/50 border-destructive";
    if (status === "reservado") return "bg-amber-500/50 border-amber-500";
    if (ocupacao === 0) return "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
    if (ocupacao < 50) return "bg-success/30 border-success/50";
    if (ocupacao < 90) return "bg-success/60 border-success";
    return "bg-success border-success-foreground/20";
  };

  return (
    <Card className={cn(
      "w-full overflow-hidden transition-all duration-500 bg-background/50 backdrop-blur-sm border-primary/10",
      isMaximized ? "fixed inset-4 z-50 h-[calc(100vh-32px)]" : "relative"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-primary/5">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Layout do Armazém 3D
        </CardTitle>
        <div className="flex gap-2">
          <div className="flex bg-muted/30 p-1 rounded-lg mr-2">
          {zones.map(zone => (
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
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </CardHeader>
      <CardContent className={cn("p-6", isMaximized ? "h-[calc(100%-80px)] overflow-y-auto" : "")}>
        <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <div className="flex gap-8 min-w-max">
            {corridors.map(corridor => (
              <div key={corridor} className="space-y-4">
                <h4 className="text-center font-bold text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/20 py-1 rounded">Cor {corridor}</h4>
                <div className="grid gap-1.5">
                  {Array.from({ length: maxLevel }, (_, i) => maxLevel - i).map(level => (
                    <div key={level} className="flex gap-1">
                      {filteredPositions
                        .filter(p => p.corredor === corridor && p.nivel === level)
                        .sort((a, b) => a.coluna - b.coluna)
                        .map(pos => (
                          <TooltipProvider key={pos.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div 
                                  whileHover={{ scale: 1.2, zIndex: 10, rotate: 2 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onPositionClick?.(pos)}
                                  className={cn(
                                    "w-9 h-9 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center text-[10px] font-black shadow-sm",
                                    getStatusColor(pos.status, pos.ocupacao)
                                  )}
                                >
                                    {pos.nivel}-{pos.coluna}
                                  </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-2 p-1 min-w-[120px]">
                                  <div className="flex items-center justify-between border-b border-primary/10 pb-1">
                                    <p className="font-black text-primary">{pos.codigo}</p>
                                    <Badge variant="outline" className="text-[8px] h-4 uppercase">{pos.status}</Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-muted-foreground">Ocupação:</span>
                                      <span className="font-bold">{pos.ocupacao}%</span>
                                    </div>
                                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                                      <div className="bg-primary h-full transition-all" style={{ width: `${pos.ocupacao}%` }} />
                                    </div>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
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
        
        <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded" /> Vazia
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success/30 border border-success/50 rounded" /> Ocupação Baixa
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success border border-success-foreground/20 rounded" /> Ocupação Alta
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500/50 border border-amber-500 rounded" /> Reservada
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive/50 border border-destructive rounded" /> Bloqueada
          </div>
        </div>
      </CardContent>
    </Card>
  );
}