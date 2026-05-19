import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shippingService } from "../services/shippingService";
import type { Romaneio, RomaneioInput, StatusRomaneio, StatusEntrega } from "../types";

export function useRomaneios(options?: { enableRealtime?: boolean }) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel('romaneios-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'romaneios' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["romaneios"] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'romaneio_itens' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["romaneios"] });
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [options?.enableRealtime, queryClient]);

  const { data: romaneios = [], isLoading, error, refetch } = useQuery({
    queryKey: ["romaneios"],
    queryFn: shippingService.getRomaneios
  });

  const createRomaneio = useMutation({
    mutationFn: shippingService.criarRomaneio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      toast.success("Romaneio criado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar romaneio: ${err.message}`);
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: StatusRomaneio }) => {
      return shippingService.atualizarStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      toast.success("Status atualizado!");
    }
  });

  return {
    romaneios,
    isLoading,
    error,
    refetch,
    createRomaneio,
    updateStatus: (id: string, status: StatusRomaneio) => updateStatus.mutate({ id, status })
  };
}
