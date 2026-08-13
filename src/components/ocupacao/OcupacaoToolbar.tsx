import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  LayoutGrid,
  Layers,
  Thermometer,
  RefreshCw,
  Download,
  Maximize2,
  Minimize2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewMode, statusConfig, getHeatColor } from "./types";

interface OcupacaoToolbarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  filtroZona: string;
  onFiltroZonaChange: (v: string) => void;
  zonas: string[];
  filtroStatus: string;
  onFiltroStatusChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  lastUpdate: string;
}

export function OcupacaoToolbar({
  searchTerm,
  onSearchChange,
  filtroZona,
  onFiltroZonaChange,
  zonas,
  filtroStatus,
  onFiltroStatusChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExportCSV,
  onToggleFullscreen,
  isFullscreen,
  lastUpdate,
}: OcupacaoToolbarProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar posição, porta-palete, zona..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9"
              aria-label="Buscar posições"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filtroZona} onValueChange={onFiltroZonaChange}>
              <SelectTrigger className="h-9 w-36">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zonas.map((z) => (
                  <SelectItem key={z} value={z}>
                    {z === "todas" ? "Todas Zonas" : `Zona ${z}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={onFiltroStatusChange}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex rounded-md bg-muted p-0.5">
              <Button
                variant={viewMode === "rack" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5"
                onClick={() => onViewModeChange("rack")}
                aria-label="Visualização rack"
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5"
                onClick={() => onViewModeChange("grid")}
                aria-label="Visualização grade"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "heatmap" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5"
                onClick={() => onViewModeChange("heatmap")}
                aria-label="Mapa de calor"
              >
                <Thermometer className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={onExportCSV}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={onToggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
          <div className="flex flex-wrap gap-3" role="list" aria-label="Legenda de status">
            {viewMode === "heatmap" ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Baixa</span>
                <div className="flex h-3 w-24 overflow-hidden rounded-full">
                  {[0, 25, 50, 75, 100].map((v) => (
                    <div key={v} className="flex-1" style={{ backgroundColor: getHeatColor(v) }} />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">Alta</span>
              </div>
            ) : (
              Object.entries(statusConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  role="listitem"
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] transition-colors",
                    filtroStatus === key
                      ? "bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => onFiltroStatusChange(filtroStatus === key ? "todos" : key)}
                >
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: cfg.color }} />
                  <span>{cfg.label}</span>
                </button>
              ))
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Atualizado às {lastUpdate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
