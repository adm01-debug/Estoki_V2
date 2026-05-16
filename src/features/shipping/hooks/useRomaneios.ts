import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shippingService } from '../services/shippingService';
import { toast } from 'sonner';
import type { Romaneio, RomaneioInput, StatusRomaneio } from '../types';

export type { StatusRomaneio, StatusEntrega } from '../types';

export function useRomaneios() {
  const queryClient = useQueryClient();

  const { data: romaneios = [], isLoading, error, refetch } = useQuery({
    queryKey: ['romaneios'],
    queryFn: shippingService.getRomaneios,
  });

  const createRomaneioMutation = useMutation({
    mutationFn: shippingService.criarRomaneio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['romaneios'] });
      toast.success('Romaneio criado com sucesso!');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: StatusRomaneio }) => 
      shippingService.atualizarStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['romaneios'] });
      toast.success(`Status atualizado para: ${variables.status}`);
    },
  });

  return {
    romaneios,
    loading: isLoading,
    error,
    refetch,
    criarRomaneio: createRomaneioMutation.mutateAsync,
    atualizarStatus: (id: string, status: StatusRomaneio) => 
      updateStatusMutation.mutateAsync({ id, status }),
  };
}
