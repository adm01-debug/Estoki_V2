import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Bookmark, Save, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface SavedFiltersManagerProps {
  modulo: string;
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
}

export function SavedFiltersManager({ modulo, currentFilters, onApplyFilter }: SavedFiltersManagerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  const { data: savedFilters = [] } = useQuery({
    queryKey: ['saved-filters', modulo, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .eq('modulo', modulo)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (nome: string) => {
      if (!user?.id) throw new Error('Não autenticado');
      const { error } = await supabase.from('saved_filters').insert({
        user_id: user.id,
        nome,
        modulo,
        filtros: currentFilters,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', modulo] });
      toast.success('Filtro salvo com sucesso!');
      setShowSaveDialog(false);
      setFilterName('');
    },
    onError: () => toast.error('Erro ao salvar filtro'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_filters').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', modulo] });
      toast.success('Filtro removido');
    },
  });

  const hasActiveFilters = Object.values(currentFilters).some(v => v !== '' && v !== undefined && v !== null);

  return (
    <>
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
            <Save className="h-4 w-4 mr-1" /> Salvar Filtro
          </Button>
        )}

        {savedFilters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-1" /> Meus Filtros
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtros Salvos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {savedFilters.map((filter: any) => (
                <DropdownMenuItem key={filter.id} className="flex items-center justify-between">
                  <span
                    className="flex-1 cursor-pointer"
                    onClick={() => onApplyFilter(filter.filtros as Record<string, unknown>)}
                  >
                    {filter.nome}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(filter.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Filtro</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome do filtro..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && filterName && saveMutation.mutate(filterName)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate(filterName)} disabled={!filterName || saveMutation.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
