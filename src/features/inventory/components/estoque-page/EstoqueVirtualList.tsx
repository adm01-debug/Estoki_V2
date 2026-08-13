import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Package, Warehouse, History, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import type { PosicaoEstoque } from "@/types/inventory";

interface EstoqueVirtualListProps {
  positions: PosicaoEstoque[];
  onSelect: (p: PosicaoEstoque) => void;
  className?: string;
}

export function EstoqueVirtualList({ positions, onSelect, className }: EstoqueVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: positions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90,
    overscan: 5,
  });

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="mb-4 h-12 w-12" />
        <p>Nenhuma posição ocupada encontrada</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn(
        "h-[600px] overflow-auto rounded-md border border-border/50 bg-background/50",
        className
      )}
      role="list"
      aria-label="Lista de posições ocupadas"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const position = positions[virtualRow.index];
          const diasArmazenado = position.created_at
            ? differenceInDays(new Date(), new Date(position.created_at))
            : 0;
          const label = `Posição ${position.codigo}, ${position.tipo}, Rua ${position.porta_palete}, Nível ${position.nivel}. Ocupada há ${diasArmazenado} dias com ${position.saldos?.length || 0} itens.`;

          return (
            <div
              key={virtualRow.key}
              role="listitem"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="p-2"
            >
              <div
                onClick={() => onSelect(position)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(position);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={label}
                className={cn(
                  "group flex h-full cursor-pointer items-center justify-between rounded-xl border bg-card/80 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  diasArmazenado > 30 && "border-l-4 border-l-warning shadow-warning/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Posição ${position.codigo}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        ${position.tipo}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <History className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Rua ${position.porta_palete} • Nível ${position.nivel} • Seção $
                        {position.secao}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end text-right">
                    <Badge
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        diasArmazenado > 30
                          ? "border-warning/30 bg-warning/20 text-warning"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      ${diasArmazenado} dias
                    </Badge>
                    <span className="mt-1 text-[10px] text-muted-foreground">
                      ${position.saldos?.length || 0} itens
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 translate-x-0 text-muted-foreground transition-colors group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
