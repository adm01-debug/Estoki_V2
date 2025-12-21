import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface BulkActionItem {
  id: string;
  [key: string]: unknown;
}

export interface BulkAction<T extends BulkActionItem> {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
  action: (items: T[]) => Promise<void> | void;
  confirmMessage?: string;
}

export function useBulkActions<T extends BulkActionItem>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const selectedItems = items.filter(item => selectedIds.has(item.id));
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < items.length;
  
  const toggleItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);
  
  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  }, [items, allSelected]);
  
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);
  
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);
  
  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);
  
  const executeAction = useCallback(async (action: BulkAction<T>) => {
    if (selectedItems.length === 0) {
      toast.error('Selecione pelo menos um item');
      return;
    }
    
    if (action.confirmMessage) {
      const confirmed = window.confirm(
        action.confirmMessage.replace('{count}', String(selectedItems.length))
      );
      if (!confirmed) return;
    }
    
    setIsProcessing(true);
    try {
      await action.action(selectedItems);
      toast.success(`Ação executada em ${selectedItems.length} item(s)`);
      clearSelection();
    } catch (error) {
      toast.error('Erro ao executar ação');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, clearSelection]);
  
  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    allSelected,
    someSelected,
    isProcessing,
    toggleItem,
    toggleAll,
    clearSelection,
    selectAll,
    isSelected,
    executeAction
  };
}
