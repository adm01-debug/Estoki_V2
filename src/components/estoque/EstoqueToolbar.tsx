import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, Package } from 'lucide-react';
import { SearchInput } from '@/components/SearchInput';
import { SavedFiltersDropdown } from '@/components/SavedFiltersDropdown';
import { DataImporter } from '@/components/DataImporter';
import { produtoEstoqueSchema } from '@/lib/wmsSchemas';
import { downloadExcel } from '@/lib/excelImporter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EstoqueToolbarProps {
  onSearch: (term: string) => void;
  onRefresh: () => void;
  onNewClick: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAjustar: () => void;
  currentFilters: Record<string, unknown>;
  data?: Record<string, unknown>[];
}

export const EstoqueToolbar = memo(function EstoqueToolbar({ onSearch, onRefresh, onNewClick, selectedCount, onClearSelection, onBulkAjustar, currentFilters, data = [] }: EstoqueToolbarProps) {
  const handleImport = async (produtos: unknown[]) => {
    const { error } = await (supabase.from('produtos_estoque' as any) as any).insert(produtos);
    if (error) throw error;
    toast.success(`${produtos.length} produtos importados!`);
    onRefresh();
  };

  const handleExport = () => {
    if (data.length === 0) { toast.warning('Nenhum dado'); return; }
    downloadExcel(data, 'estoque', 'Estoque');
    toast.success('Exportado!');
  };

  return (
    <div className="space-y-3">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedCount} selecionado(s)</span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>Limpar</Button>
          <Button variant="outline" size="sm" onClick={onBulkAjustar}>
            <Package className="h-4 w-4 mr-1" /> Ajustar Estoque
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <SearchInput onChange={onSearch} placeholder="Buscar produto..." className="w-64" />
          <SavedFiltersDropdown entityType="produtos_estoque" currentFilters={currentFilters} onApplyFilter={() => {}} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>
          <DataImporter schema={produtoEstoqueSchema} onImport={handleImport} entityName="Produtos" trigger={<Button variant="outline" size="sm"><Upload className="h-4 w-4" /></Button>} />
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4" /></Button>
          <Button size="sm" onClick={onNewClick}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
});
export default EstoqueToolbar;
