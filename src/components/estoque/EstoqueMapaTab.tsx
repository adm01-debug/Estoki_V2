 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
 import { ZoomIn, ZoomOut, Maximize2, MapPin, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { PosicaoEstoque, StatusPosicao } from "@/hooks/useEstoque";
import { differenceInDays } from "date-fns";

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

 export function EstoqueMapaTab({ filteredPositions, ruas, zoom, onZoomChange, onSelectPosition }: EstoqueMapaTabProps) {
   const [heatmapEnabled, setHeatmapEnabled] = useState(false);
 
  const getDiasArmazenado = (pos: PosicaoEstoque): number => {
    if (!pos.created_at) return 0;
    return differenceInDays(new Date(), new Date(pos.created_at));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
           <Button variant="outline" size="icon" onClick={() => onZoomChange(1)} title="Reset Zoom"><Maximize2 className="h-4 w-4" /></Button>
           <Button 
             variant={heatmapEnabled ? "default" : "outline"} 
             size="sm" 
             className="gap-2 ml-2"
             onClick={() => setHeatmapEnabled(!heatmapEnabled)}
           >
             <Flame className={cn("h-4 w-4", heatmapEnabled && "animate-pulse")} />
             <span className="hidden sm:inline">Heatmap</span>
           </Button>
        </div>
        <Badge variant="outline" className="text-xs">{filteredPositions.length} posições</Badge>
      </div>

      <div className="overflow-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[600px] transition-transform" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          {ruas.map((rua, ruaIndex) => {
            const ruaPositions = filteredPositions.filter(p => p.porta_palete === rua);
            if (ruaPositions.length === 0) return null;
            const ruaNiveis = [...new Set(ruaPositions.map(p => p.nivel).filter(Boolean))].sort().reverse();
            const ruaSecoes = [...new Set(ruaPositions.map(p => p.secao).filter(Boolean))].sort((a, b) => parseInt(a!) - parseInt(b!));

            return (
              <motion.div key={rua} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: ruaIndex * 0.1 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />PP {rua}</span>
                      <Badge variant="secondary" className="text-xs">{ruaPositions.filter(p => p.status === "ocupado").length}/{ruaPositions.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-1">
                      {ruaNiveis.map(nivel => (
                        <div key={nivel} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-6 font-medium">N{nivel}</span>
                          <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(ruaSecoes.length, 10)}, 1fr)` }}>
                            {ruaSecoes.slice(0, 10).map(secao => {
                              const position = ruaPositions.find(p => p.nivel === nivel && p.secao === secao);
                              if (!position) return <div key={secao} className="h-8 rounded bg-muted/30" />;
                               const config = statusConfig[position.status];
                               const diasArmazenado = getDiasArmazenado(position);
                               
                               let heatmapStyle = {};
                               if (heatmapEnabled && position.status === 'ocupado') {
                                 if (diasArmazenado > 60) heatmapStyle = { backgroundColor: '#ef4444', color: 'white', borderColor: '#b91c1c' }; // Red
                                 else if (diasArmazenado > 30) heatmapStyle = { backgroundColor: '#f97316', color: 'white', borderColor: '#c2410c' }; // Orange
                                 else if (diasArmazenado > 15) heatmapStyle = { backgroundColor: '#eab308', color: 'white', borderColor: '#a16207' }; // Yellow
                                 else heatmapStyle = { backgroundColor: '#22c55e', color: 'white', borderColor: '#15803d' }; // Green
                               }
                              return (
                                <motion.button
                                  key={position.id}
                                  onClick={() => onSelectPosition(position)}
                                   className={cn(
                                     "h-8 rounded-md border-2 transition-all text-[10px] font-medium relative group", 
                                     !heatmapEnabled && config.bg, 
                                     !heatmapEnabled && config.border,
                                     "hover:ring-2 hover:ring-primary hover:ring-offset-1"
                                   )}
                                   style={heatmapStyle}
                                  whileHover={{ scale: 1.1, zIndex: 10 }}
                                  whileTap={{ scale: 0.95 }}
                                  title={`${position.codigo} - ${config.label}`}
                                >
                                  {position.status === 'ocupado' && diasArmazenado > 30 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning animate-pulse" />
                                  )}
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">{secao}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-6" />
                        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(ruaSecoes.length, 10)}, 1fr)` }}>
                          {ruaSecoes.slice(0, 10).map(secao => (
                            <span key={secao} className="text-[10px] text-muted-foreground text-center">{secao}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center py-2 border-t">
        {(Object.entries(statusConfig) as [StatusPosicao, typeof statusConfig[StatusPosicao]][]).map(([status, config]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded border-2", config.bg, config.border)} />
            <span className="text-sm text-muted-foreground">{config.label}</span>
          </div>
        ))}
       <AnimatePresence>
         {heatmapEnabled ? (
           <motion.div 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }} 
             exit={{ opacity: 0, y: 10 }}
             className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg"
           >
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#22c55e]" /><span className="text-[10px]">Recente</span></div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#eab308]" /><span className="text-[10px]">+15d</span></div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#f97316]" /><span className="text-[10px]">+30d</span></div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /><span className="text-[10px]">+60d</span></div>
             <Info className="h-3 w-3 text-muted-foreground ml-2" />
             <span className="text-[10px] text-muted-foreground">Idade do Estoque</span>
           </motion.div>
         ) : (
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
             <span className="text-sm text-muted-foreground">+30 dias</span>
           </div>
         )}
       </AnimatePresence>
      </div>
    </div>
  );
}
