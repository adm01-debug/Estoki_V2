import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AtividadeRecente {
  id: string;
  type: 'recebimento' | 'triagem' | 'divergencia' | 'movimentacao' | 'tarefa';
  desc: string;
  time: string;
  status: 'success' | 'danger' | 'warning' | 'default';
  created_at: string;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

export function useAtividadeRecente(limit: number = 10) {
  const [atividades, setAtividades] = useState<AtividadeRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAtividades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const atividades: AtividadeRecente[] = [];

      // 1. Buscar eventos de rastreamento recentes
      const { data: rastreamento, error: rastError } = await supabase
        .from('rastreamento_historico')
        .select('id, tipo_evento, descricao, created_at, quantidade')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (rastError) console.error('Erro rastreamento:', rastError);

      (rastreamento || []).forEach(r => {
        let type: AtividadeRecente['type'] = 'movimentacao';
        let status: AtividadeRecente['status'] = 'default';

        switch (r.tipo_evento) {
          case 'recebimento_nf':
          case 'conferencia':
            type = 'recebimento';
            status = 'success';
            break;
          case 'triagem_inicio':
          case 'triagem_fim':
            type = 'triagem';
            status = 'success';
            break;
          case 'devolucao':
            type = 'divergencia';
            status = 'warning';
            break;
          case 'separacao':
          case 'armazenamento':
          case 'carregamento':
            type = 'movimentacao';
            status = 'default';
            break;
        }

        atividades.push({
          id: r.id,
          type,
          desc: r.descricao,
          time: formatTimeAgo(new Date(r.created_at)),
          status,
          created_at: r.created_at,
        });
      });

      // 2. Buscar lotes com divergência recentes
      const { data: divergencias, error: divError } = await supabase
        .from('lotes')
        .select('id, numero_lote, updated_at, status')
        .eq('status', 'divergencia')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (divError) console.error('Erro divergências:', divError);

      (divergencias || []).forEach(d => {
        atividades.push({
          id: `div-${d.id}`,
          type: 'divergencia',
          desc: `Divergência Lote ${d.numero_lote}`,
          time: formatTimeAgo(new Date(d.updated_at)),
          status: 'danger',
          created_at: d.updated_at,
        });
      });

      // 3. Buscar triagens recentes
      const { data: triagens, error: triError } = await supabase
        .from('eventos_triagem')
        .select(`
          id, 
          resultado, 
          data_fim, 
          created_at,
          produtos (nome)
        `)
        .not('data_fim', 'is', null)
        .order('data_fim', { ascending: false })
        .limit(5);

      if (triError) console.error('Erro triagens:', triError);

      (triagens || []).forEach(t => {
        const produtoNome = (t.produtos as any)?.nome || 'Produto';
        let status: AtividadeRecente['status'] = 'success';
        
        if (t.resultado === 'reprovado') status = 'danger';
        else if (t.resultado === 'ressalva') status = 'warning';

        atividades.push({
          id: `triagem-${t.id}`,
          type: 'triagem',
          desc: `${produtoNome} - ${t.resultado || 'concluída'}`,
          time: formatTimeAgo(new Date(t.data_fim!)),
          status,
          created_at: t.data_fim!,
        });
      });

      // 4. Buscar lotes recebidos recentemente
      const { data: recebidos, error: recError } = await supabase
        .from('lotes')
        .select('id, numero_lote, updated_at, status, nf_entrada')
        .in('status', ['recebido', 'conferido'])
        .order('updated_at', { ascending: false })
        .limit(5);

      if (recError) console.error('Erro recebidos:', recError);

      (recebidos || []).forEach(r => {
        atividades.push({
          id: `receb-${r.id}`,
          type: 'recebimento',
          desc: r.nf_entrada ? `NF ${r.nf_entrada} ${r.status}` : `Lote ${r.numero_lote} ${r.status}`,
          time: formatTimeAgo(new Date(r.updated_at)),
          status: 'success',
          created_at: r.updated_at,
        });
      });

      // 5. Buscar tarefas concluídas recentemente
      const { data: tarefas, error: tarefasError } = await supabase
        .from('tarefas')
        .select('id, tipo, data_conclusao')
        .eq('status', 'concluida')
        .not('data_conclusao', 'is', null)
        .order('data_conclusao', { ascending: false })
        .limit(5);

      if (tarefasError) console.error('Erro tarefas:', tarefasError);

      (tarefas || []).forEach(t => {
        atividades.push({
          id: `tarefa-${t.id}`,
          type: 'tarefa',
          desc: `Tarefa ${t.tipo} concluída`,
          time: formatTimeAgo(new Date(t.data_conclusao!)),
          status: 'success',
          created_at: t.data_conclusao!,
        });
      });

      // Ordenar por data e limitar
      atividades.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAtividades(atividades.slice(0, limit));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar atividades';
      setError(message);
      console.error('Erro atividades:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAtividades();

    // Realtime updates
    const channel = supabase
      .channel('atividades_recentes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rastreamento_historico' },
        () => fetchAtividades()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lotes' },
        () => fetchAtividades()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_triagem' },
        () => fetchAtividades()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tarefas' },
        () => fetchAtividades()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAtividades]);

  return {
    atividades,
    loading,
    error,
    refetch: fetchAtividades,
  };
}
