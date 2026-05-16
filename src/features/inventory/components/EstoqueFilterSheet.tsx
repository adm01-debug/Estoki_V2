import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPosicao } from "../hooks/useEstoque";

const statusConfig: Record<StatusPosicao, { color: string; bg: string; border: string; label: string }> = {
  livre: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-dashed border-border", label: "Livre" },
  ocupado: { color: "text-success", bg: "bg-success/20", border: "border-success", label: "Ocupado" },
  reservado: { color: "text-warning", bg: "bg-warning/20", border: "border-warning", label: "Reservado" },
  bloqueado: { color: "text-destructive", bg: "bg-destructive/20", border: "border-destructive", label: "Bloqueado" },
};

interface Filters {
  status: StatusPosicao[];
  ruas: string[];
  niveis: string[];
  search: string;
}

interface EstoqueFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  ruas: string[];
  niveis: string[];
  activeFiltersCount: number;
  onToggleFilter: (type: keyof Filters, value: string | StatusPosicao) => void;
  onReset: () => void;
}

export function EstoqueFilterSheet({ open, onOpenChange, filters, ruas, niveis, activeFiltersCount, onToggleFilter, onReset }: EstoqueFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFiltersCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filtros
            <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />Limpar
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {(["ocupado", "livre", "reservado", "bloqueado"] as StatusPosicao[]).map(status => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox id={`status-${status}`} checked={filters.status.includes(status)} onCheckedChange={() => onToggleFilter("status", status)} />
                  <Label htmlFor={`status-${status}`} className="flex items-center gap-2 cursor-pointer">
                    <div className={cn("w-3 h-3 rounded-sm", statusConfig[status].bg, "border", statusConfig[status].border)} />
                    {statusConfig[status].label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          {ruas.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Porta-Paletes</Label>
              <div className="flex flex-wrap gap-2">
                {ruas.map(rua => (
                  <Button key={rua} variant={filters.ruas.includes(rua) ? "default" : "outline"} size="sm" onClick={() => onToggleFilter("ruas", rua)}>{rua}</Button>
                ))}
              </div>
            </div>
          )}
          {niveis.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Níveis</Label>
              <div className="flex flex-wrap gap-2">
                {niveis.map(nivel => (
                  <Button key={nivel} variant={filters.niveis.includes(nivel) ? "default" : "outline"} size="sm" onClick={() => onToggleFilter("niveis", nivel)}>N{nivel}</Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
