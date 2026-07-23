import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, RefreshCw } from "lucide-react";
import { useHead } from "@/hooks/useHead";
import { useKanbanData } from "@/components/kanban/useKanbanData";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { LoteDetailDialog } from "@/components/kanban/LoteDetailDialog";

export default function KanbanPipeline() {
  const { setTitle } = useHead();
  useEffect(() => {
    setTitle("Kanban Pipeline | ESTOKI");
  }, [setTitle]);

  const {
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedLote,
    setSelectedLote,
    columns,
    totalLotes,
  } = useKanbanData();

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pipeline de Materiais</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe cada lote da coleta até a entrega — {totalLotes} lotes no sistema
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar lote, produto, NF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {columns.map((col) => (
          <Badge key={col.id} variant="outline" className="gap-1.5 px-2.5 py-1">
            <col.icon className="h-3 w-3" />
            {col.title}: <span className="font-bold">{col.items.length}</span>
          </Badge>
        ))}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-72 flex-shrink-0 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex min-w-max gap-4 pb-4">
            {columns.map((col) => (
              <KanbanColumn key={col.id} column={col} onLoteClick={setSelectedLote} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Detail dialog */}
      <LoteDetailDialog
        lote={selectedLote}
        open={!!selectedLote}
        onClose={() => setSelectedLote(null)}
      />
    </div>
  );
}
