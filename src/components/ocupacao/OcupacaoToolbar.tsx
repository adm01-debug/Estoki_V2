import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, LayoutGrid, Layers, Thermometer,
  RefreshCw, Download, Maximize2, Minimize2, Filter
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
  searchTerm, onSearchChange, filtroZona, onFiltroZonaChange, zonas,
  filtroStatus, onFiltroStatusChange, viewMode, onViewModeChange,
  onRefresh, onExportCSV, onToggleFullscreen, isFullscreen, lastUpdate,
}: OcupacaoToolbarProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar posição, porta-palete, zona..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-9" aria-label="Buscar posições" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filtroZona} onValueChange={onFiltroZonaChange}>
              <SelectTrigger className="w-36 h-9">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zonas.map((z) => <SelectItem key={z} value={z}>{z === "todas" ? "Todas Zonas" : `Zona ${z}`}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={onFiltroStatusChange}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="flex bg-muted rounded-md p-0.5">
              <Button variant={viewMode === "rack" ? "secondary" : "ghost"} size="sm" className="h-8 px-2.5" onClick={() => onViewModeChange("rack")} aria-label="Visualização rack"><Layers className="h-4 w-4" /></Button>
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="h-8 px-2.5" onClick={() => onViewModeChange("grid")} aria-label="Visualização grade"><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={viewMode === "heatmap" ? "secondary" : "ghost"} size="sm" className="h-8 px-2.5" onClick={() => onViewModeChange("heatmap")} aria-label="Mapa de calor"><Thermometer className="h-4 w-4" /></Button>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={onExportCSV}><Download className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={onToggleFullscreen}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border/50">
          <div className="flex flex-wrap gap-3" role="list" aria-label="Legenda de status">
            {viewMode === "heatmap" ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Baixa</span>
                <div className="flex h-3 rounded-full overflow-hidden w-24">
                  {[0, 25, 50, 75, 100].map((v) => <div key={v} className="flex-1" style={{ backgroundColor: getHeatColor(v) }} />)}
                </div>
                <span className="text-[10px] text-muted-foreground">Alta</span>
              </div>
            ) : (
              Object.entries(statusConfig).map(([key, cfg]) => (
                <button key={key} role="listitem" className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] transition-colors", filtroStatus === key ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")} onClick={() => onFiltroStatusChange(filtroStatus === key ? "todos" : key)}>
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cfg.color }} />
                  <span>{cfg.label}</span>
                </button>
              ))
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Atualizado às {lastUpdate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
