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

    positions.forEach((pos) => {
      if (!structures[pos.porta_palete]) structures[pos.porta_palete] = {};
      if (!structures[pos.porta_palete][pos.secao]) structures[pos.porta_palete][pos.secao] = [];
      structures[pos.porta_palete][pos.secao].push(pos);
    });

    return structures;
  }, [positions]);

  return (
    <div className="overflow-x-auto rounded-xl bg-muted/30 p-4">
      <div className="flex min-w-max gap-12 pb-4">
        {Object.entries(mapData).map(([ppId, secoes]) => (
          <div key={ppId} className="flex flex-col gap-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Corredor {ppId}
              </Badge>
            </div>
            <div className="flex gap-2">
              {Object.entries(secoes)
                .sort()
                .map(([secaoId, posicoes]) => (
                  <div
                    key={secaoId}
                    className="flex flex-col-reverse gap-1 border-x border-dashed border-muted-foreground/20 px-1"
                  >
                    {posicoes
                      .sort((a, b) => Number(a.nivel) - Number(b.nivel))
                      .map((pos) => (
                        <TooltipProvider key={pos.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                onClick={() => onSelectPosition?.(pos)}
                                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border text-[8px] font-bold ${
                                  pos.status === "livre"
                                    ? "border-success/40 bg-success/20 text-success"
                                    : pos.status === "ocupado"
                                      ? "border-primary/40 bg-primary/20 text-primary"
                                      : "border-warning/40 bg-warning/20 text-warning"
                                } `}
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
                    <div className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
                      {secaoId}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm border border-success/40 bg-success/20" /> Livre
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm border border-primary/40 bg-primary/20" /> Ocupado
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm border border-warning/40 bg-warning/20" /> Reservado
        </div>
      </div>
    </div>
  );
}
