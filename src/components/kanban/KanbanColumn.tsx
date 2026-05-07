import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence } from "framer-motion";
import { LoteCard } from "./LoteCard";
import { LoteKanban, KanbanColumnConfig } from "./types";

interface KanbanColumnProps {
  column: KanbanColumnConfig & { items: LoteKanban[] };
  onLoteClick: (lote: LoteKanban) => void;
}

export function KanbanColumn({ column, onLoteClick }: KanbanColumnProps) {
  const Icon = column.icon;
  
  return (
    <div className="flex-shrink-0 w-72">
      <Card className={`max-h-[calc(100vh-280px)] flex flex-col ${column.bgClass}`}>
        <CardHeader className="py-3 px-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color: column.color }} />
              <CardTitle className="text-sm">{column.title}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {column.items.length}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{column.description}</p>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 px-3 pb-3">
          <AnimatePresence mode="popLayout">
            {column.items.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum lote</p>
            ) : (
              column.items.map(lote => (
                <LoteCard
                  key={lote.id}
                  lote={lote}
                  onClick={() => onLoteClick(lote)}
                />
              ))
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
