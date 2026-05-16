import { useMemo } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface Position {
  id: string;
  codigo: string;
  zona: string;
  porta_palete: string;
  secao: string;
  nivel: string;
  status: string;
}

interface WarehouseMapProps {
  positions: Position[];
  onSelectPosition?: (pos: Position) => void;
}

export function WarehouseMap({ positions, onSelectPosition }: WarehouseMapProps) {
  // Agrupar por porta-palete e seções
  const mapData = useMemo(() => {
    const structures: Record<string, Record<string, Position[]>> = {};
    
    positions.forEach(pos => {
      if (!structures[pos.porta_palete]) structures[pos.porta_palete] = {};
      if (!structures[pos.porta_palete][pos.secao]) structures[pos.porta_palete][pos.secao] = [];
      structures[pos.porta_palete][pos.secao].push(pos);
    });
    
    return structures;
  }, [positions]);

  return (
    <div className="p-4 bg-muted/30 rounded-xl overflow-x-auto">
      <div className="flex gap-12 min-w-max pb-4">
        {Object.entries(mapData).map(([ppId, secoes]) => (
          <div key={ppId} className="flex flex-col gap-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Corredor {ppId}</Badge>
            </div>
            <div className="flex gap-2">
              {Object.entries(secoes).sort().map(([secaoId, posicoes]) => (
                <div key={secaoId} className="flex flex-col-reverse gap-1 border-x border-dashed border-muted-foreground/20 px-1">
                  {posicoes.sort((a, b) => Number(a.nivel) - Number(b.nivel)).map((pos) => (
                    <TooltipProvider key={pos.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.1, zIndex: 10 }}
                            onClick={() => onSelectPosition?.(pos)}
                            className={`
                              w-8 h-8 rounded-sm cursor-pointer border
                              flex items-center justify-center text-[8px] font-bold
                              ${pos.status === 'livre' ? 'bg-success/20 border-success/40 text-success' : 
                                pos.status === 'ocupado' ? 'bg-primary/20 border-primary/40 text-primary' : 
                                'bg-warning/20 border-warning/40 text-warning'}
                            `}
                          >
                            {pos.nivel}
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-bold">{pos.codigo}</p>
                          <p className="text-xs">Status: {pos.status}</p>
                          <p className="text-xs">Zona: {pos.zona}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  <div className="text-[10px] text-center mt-1 text-muted-foreground font-mono">{secaoId}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-success/20 border border-success/40 rounded-sm" /> Livre</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary/20 border border-primary/40 rounded-sm" /> Ocupado</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-warning/20 border border-warning/40 rounded-sm" /> Reservado</div>
      </div>
    </div>
  );
}