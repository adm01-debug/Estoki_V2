// @ts-nocheck
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, Package } from 'lucide-react';
import { SearchInput } from '@/components/SearchInput';
import { SavedFiltersDropdown } from '@/components/SavedFiltersDropdown';
import { DataImporter } from '@/components/DataImporter';
import { BulkActionsBar, defaultBulkActions } from '@/components/BulkActionsBar';
import { produtoEstoqueSchema, wmsImportTemplates } from '@/lib/wmsSchemas';
import { exportToExcel } from '@/lib/excelImporter';
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
  data?: unknown[];
}

export const EstoqueToolbar = memo(function EstoqueToolbar({ onSearch, onRefresh, onNewClick, selectedCount, onClearSelection, onBulkAjustar, currentFilters, data = [] }: EstoqueToolbarProps) {
  const handleImport = async (produtos: unknown[]) => {
    const { error } = await supabase.from('produtos_estoque').insert(produtos);
    if (error) throw error;
    toast.success(`${produtos.length} produtos importados!`);
    onRefresh();
  };

  const handleExport = () => {
    if (data.length === 0) { toast.warning('Nenhum dado'); return; }
    exportToExcel(data as Record<string, unknown>[], [
      { key: 'codigo' as const, label: 'Código' },
      { key: 'nome' as const, label: 'Nome' },
      { key: 'quantidade' as const, label: 'Qtd' },
      { key: 'localizacao' as const, label: 'Local' },
      { key: 'custo_unitario' as const, label: 'Custo' },
    ], 'estoque', 'Estoque');
    toast.success('Exportado!');
  };

  const bulkActions = [{ key: 'ajustar', label: 'Ajustar Estoque', icon: <Package className="h-4 w-4" />, onClick: onBulkAjustar }];

  return (
    <div className="space-y-3">
      {selectedCount > 0 && <BulkActionsBar selectedCount={selectedCount} onClearSelection={onClearSelection} actions={bulkActions} />}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <SearchInput onSearch={onSearch} placeholder="Buscar produto..." className="w-64" />
          <SavedFiltersDropdown entityType="produtos_estoque" currentFilters={currentFilters} onApplyFilter={() => {}} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>
          <DataImporter schema={produtoEstoqueSchema} columns={wmsImportTemplates.produtos} onImport={handleImport} templateName="produtos_estoque" title="Importar Produtos" trigger={<Button variant="outline" size="sm"><Upload className="h-4 w-4" /></Button>} onSuccess={onRefresh} />
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4" /></Button>
          <Button size="sm" onClick={onNewClick}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
});
export default EstoqueToolbar;
