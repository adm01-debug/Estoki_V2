import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ── Cadeia de Custódia ──
export function useCustodiaTransferencias() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const transferencias = useQuery({
    queryKey: ['custodia-transferencias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custodia_transferencias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const criarTransferencia = useMutation({
    mutationFn: async (params: {
      produto_id?: string;
      lote_id?: string;
      quantidade: number;
      operador_destino_id: string;
      zona_origem: string;
      zona_destino: string;
      motivo?: string;
    }) => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('custodia_transferencias')
        .insert({
          ...params,
          operador_origem_id: user.id,
          assinatura_origem: true,
          status: 'pendente',
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodia-transferencias'] });
      toast.success('Transferência de custódia registrada');
    },
    onError: () => toast.error('Erro ao registrar transferência'),
  });

  const confirmarRecebimento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custodia_transferencias')
        .update({
          assinatura_destino: true,
          status: 'confirmado',
          confirmado_em: new Date().toISOString(),
        } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custodia-transferencias'] });
      toast.success('Recebimento confirmado com assinatura digital');
    },
    onError: () => toast.error('Erro ao confirmar recebimento'),
  });

  return { transferencias, criarTransferencia, confirmarRecebimento };
}

// ── Checkpoints por Zona ──
export function useCheckpointsZona() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const checkpoints = useQuery({
    queryKey: ['checkpoints-zona'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkpoints_zona')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const registrarCheckpoint = useMutation({
    mutationFn: async (params: {
      produto_id?: string;
      lote_id?: string;
      quantidade: number;
      zona: string;
      tipo: 'entrada' | 'saida';
      posicao_id?: string;
      observacoes?: string;
    }) => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('checkpoints_zona')
        .insert({
          ...params,
          operador_id: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkpoints-zona'] });
      toast.success('Checkpoint registrado');
    },
    onError: () => toast.error('Erro ao registrar checkpoint'),
  });

  // Items stuck in a zone (entered but never left)
  const itensPresos = useQuery({
    queryKey: ['checkpoints-itens-presos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkpoints_zona')
        .select('*')
        .eq('tipo', 'entrada')
        .order('created_at', { ascending: true })
        .limit(500);
      if (error) throw error;

      // Group by lote_id+zona and find entries without a corresponding exit
      const entradas = new Map<string, typeof data[number]>();
      (data || []).forEach((cp) => {
        const key = `${cp.lote_id || cp.produto_id}-${cp.zona}`;
        entradas.set(key, cp);
      });

      // Get exits
      const { data: saidas } = await supabase
        .from('checkpoints_zona')
        .select('*')
        .eq('tipo', 'saida')
        .limit(500);

      (saidas || []).forEach((cp) => {
        const key = `${cp.lote_id || cp.produto_id}-${cp.zona}`;
        if (entradas.has(key)) {
          const entrada = entradas.get(key);
          if (new Date(cp.created_at) > new Date(entrada.created_at)) {
            entradas.delete(key);
          }
        }
      });

      // Filter items stuck for more than 4 hours
      const agora = Date.now();
      const presos: any[] = [];
      entradas.forEach((cp) => {
        const horasDecorridas = (agora - new Date(cp.created_at).getTime()) / (1000 * 60 * 60);
        if (horasDecorridas > 4) {
          presos.push({ ...cp, horas_preso: Math.round(horasDecorridas) });
        }
      });

      return presos;
    },
  });

  return { checkpoints, registrarCheckpoint, itensPresos };
}

// ── Ocorrências de Perda ──
export function useOcorrenciasPerda() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ocorrencias = useQuery({
    queryKey: ['ocorrencias-perda'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocorrencias_perda')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const criarOcorrencia = useMutation({
    mutationFn: async (params: {
      tipo: string;
      produto_id?: string;
      lote_id?: string;
      quantidade: number;
      zona_detectada?: string;
      valor_prejuizo?: number;
    }) => {
      if (!user) throw new Error('Não autenticado');
      const codigo = `OC-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('ocorrencias_perda')
        .insert({
          ...params,
          codigo,
          reportado_por: user.id,
          status: 'aberto',
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-perda'] });
      toast.success('Ocorrência registrada com sucesso');
    },
    onError: () => toast.error('Erro ao registrar ocorrência'),
  });

  const atualizarOcorrencia = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; parecer?: string; acao_corretiva?: string; investigado_por?: string }) => {
      const { error } = await supabase
        .from('ocorrencias_perda')
        .update({
          ...updates,
          ...(updates.status === 'encerrado' ? { data_encerramento: new Date().toISOString() } : {}),
          ...(updates.status === 'investigacao' ? { data_investigacao: new Date().toISOString(), investigado_por: user?.id } : {}),
        } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias-perda'] });
      toast.success('Ocorrência atualizada');
    },
    onError: () => toast.error('Erro ao atualizar ocorrência'),
  });

  // Stats
  const stats = useQuery({
    queryKey: ['ocorrencias-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocorrencias_perda')
        .select('status, tipo, valor_prejuizo, zona_detectada');
      if (error) throw error;
      const items = data || [];
      return {
        total: items.length,
        abertas: items.filter((o: any) => o.status === 'aberto').length,
        investigacao: items.filter((o: any) => o.status === 'investigacao').length,
        encerradas: items.filter((o: any) => o.status === 'encerrado').length,
        prejuizoTotal: items.reduce((s: number, o: any) => s + (Number(o.valor_prejuizo) || 0), 0),
        porZona: items.reduce((acc: Record<string, number>, o: any) => {
          const z = o.zona_detectada || 'Não informada';
          acc[z] = (acc[z] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
  });

  return { ocorrencias, criarOcorrencia, atualizarOcorrencia, stats };
}
