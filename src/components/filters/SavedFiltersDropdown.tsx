import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Filter, Star, Trash2, Copy, Save, Loader2 } from "lucide-react";
import { useSavedFilters, CreateFilterInput } from "@/hooks/useSavedFilters";
import { Badge } from "@/components/ui/badge";

interface SavedFiltersDropdownProps {
  entityType: string;
  currentFilters: Record<string, any>;
  onApplyFilter: (filters: Record<string, any>) => void;
}

export function SavedFiltersDropdown({
  entityType,
  currentFilters,
  onApplyFilter,
}: SavedFiltersDropdownProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  const {
    filters,
    isLoading,
    saveFilter,
    deleteFilter,
    setDefault,
    duplicateFilter,
    incrementUsage,
    isSaving,
  } = useSavedFilters(entityType);

  const handleSave = () => {
    if (!filterName.trim()) return;

    const input: CreateFilterInput = {
      name: filterName.trim(),
      filters: currentFilters,
      description: filterDescription.trim() || undefined,
    };

    saveFilter(input);
    setShowSaveDialog(false);
    setFilterName("");
    setFilterDescription("");
  };

  const handleApply = (filters: Record<string, any>, filterId: string) => {
    onApplyFilter(filters);
    incrementUsage(filterId);
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros Salvos
            {filters.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Meus Filtros</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {hasActiveFilters && (
            <>
              <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Filtro Atual
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {filters.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhum filtro salvo
            </div>
          ) : (
            filters.map((filter) => (
              <DropdownMenuItem
                key={filter.id}
                className="flex items-center justify-between p-2"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleApply(filter.filters, filter.id)}
                >
                  <div className="flex items-center gap-2">
                    {filter.is_default && (
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    )}
                    <span className="font-medium">{filter.name}</span>
                  </div>
                  {filter.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {filter.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefault(filter.id);
                    }}
                    title="Definir como padrão"
                  >
                    <Star className={`h-3 w-3 ${filter.is_default ? "fill-yellow-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateFilter(filter);
                    }}
                    title="Duplicar"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFilter(filter.id);
                    }}
                    title="Remover"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Filtro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Nome do Filtro *</Label>
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ex: Produtos em estoque baixo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Descrição (opcional)</Label>
              <Textarea
                id="filter-description"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                placeholder="Descreva o que este filtro faz..."
                rows={2}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Filtros a serem salvos:</p>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(currentFilters, null, 2)}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!filterName.trim() || isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
