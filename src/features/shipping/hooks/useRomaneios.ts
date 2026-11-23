import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shippingService } from "../services/shippingService";
import type { Romaneio, RomaneioInput, StatusRomaneio, StatusEntrega } from "../types";
export type { Romaneio, RomaneioInput, StatusRomaneio, StatusEntrega };

export function useRomaneios(options?: { enableRealtime?: boolean }) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel("romaneios-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "romaneios" }, () => {
        queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "romaneio_itens" }, () => {
        queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      })
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [options?.enableRealtime, queryClient]);

  const {
    data: romaneios = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["romaneios"],
    queryFn: shippingService.getRomaneios,
  });

  const createRomaneioMutation = useMutation({
    mutationFn: shippingService.criarRomaneio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      toast.success("Romaneio criado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar romaneio: ${err.message}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusRomaneio }) => {
      return shippingService.atualizarStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      toast.success("Status atualizado!");
    },
  });


  const confirmarRomaneioMutation = useMutation({
    mutationFn: async (id: string) => {
      return shippingService.confirmarRomaneio(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });
      toast.success("Romaneio confirmado! Rota liberada para iniciar.");
    },
    onError: (err: Error) => {
      toast.error(Erro ao confirmar romaneio: \);
    },
  });

  return {
    romaneios,
    isLoading,
    loading: isLoading,
    error,
    refetch,
    createRomaneio: createRomaneioMutation.mutate,
    criarRomaneio: createRomaneioMutation.mutate,
    updateStatus: (id: string, status: StatusRomaneio) =>
      updateStatusMutation.mutate({ id, status }),
    confirmarRomaneio: (id: string) => confirmarRomaneioMutation.mutate(id),
    atualizarStatus: (id: string, status: StatusRomaneio) =>
      updateStatusMutation.mutate({ id, status }),
    registrarEntrega: async (romaneioId: string, itemId: string, status: StatusEntrega, dados?: Record<string, unknown>) => {
      try {
        await shippingService.registrarEntrega(romaneioId, itemId, status, dados);
        queryClient.invalidateQueries({ queryKey: ["romaneios"] });
        toast.success("Entrega registrada com sucesso!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro ao registrar entrega";
        toast.error(message);
      }
    },
  };
}
