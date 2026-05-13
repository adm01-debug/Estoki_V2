import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-bold">Mapa do Armazém</CardTitle>
        <div className="flex gap-2">
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
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max">
            {corridors.map(corridor => (
              <div key={corridor} className="space-y-4">
                <h4 className="text-center font-bold text-xs text-muted-foreground">Corredor {corridor}</h4>
                <div className="grid gap-1">
                  {Array.from({ length: maxLevel }, (_, i) => maxLevel - i).map(level => (
                    <div key={level} className="flex gap-1">
                      {filteredPositions
                        .filter(p => p.corredor === corridor && p.nivel === level)
                        .sort((a, b) => a.coluna - b.coluna)
                        .map(pos => (
                          <TooltipProvider key={pos.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  onClick={() => onPositionClick?.(pos)}
                                  className={cn(
                                    "w-8 h-8 rounded border transition-all cursor-pointer hover:scale-110 flex items-center justify-center text-[8px] font-bold",
                                    getStatusColor(pos.status, pos.ocupacao)
                                  )}
                                >
                                  {pos.coluna}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-bold">{pos.codigo}</p>
                                  <p className="text-xs">Status: {pos.status}</p>
                                  <p className="text-xs">Ocupação: {pos.ocupacao}%</p>
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