import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TipoNotificacao = 
  | 'estoque_baixo' 
  | 'triagem_pendente' 
  | 'recebimento' 
  | 'alerta' 
  | 'info' 
  | 'success' 
  | 'warning';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  dados?: Record<string, unknown>;
  severidade?: 'info' | 'warning' | 'critical';
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotificacoes = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar alertas ativos do sistema
      const { data: alertas, error: alertasError } = await supabase
        .from('alertas_historico')
        .select('*')
        .in('status', ['ativo', 'reconhecido'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertasError) {
        console.error('Erro ao buscar alertas:', alertasError);
      }

      // Buscar triagens pendentes (gerar notificações automáticas)
      const { data: triagensPendentes, error: triagensError } = await supabase
        .from('triagens')
        .select('id, pedido, produto, prioridade, created_at')
        .eq('status', 'aguardando')
        .order('created_at', { ascending: true })
        .limit(5);

      if (triagensError) {
        console.error('Erro ao buscar triagens:', triagensError);
      }

      // Buscar recebimentos recentes
      const ontemData = new Date();
      ontemData.setDate(ontemData.getDate() - 1);

      const { data: recebimentos, error: recError } = await supabase
        .from('recebimentos')
        .select('id, pedido, fornecedor, status, created_at')
        .eq('status', 'chegou')
        .gte('created_at', ontemData.toISOString())
        .limit(5);

      if (recError) {
        console.error('Erro ao buscar recebimentos:', recError);
      }

      // Montar lista de notificações
      const notifs: Notificacao[] = [];

      // Alertas do sistema
      alertas?.forEach(alerta => {
        notifs.push({
          id: alerta.id,
          tipo: 'alerta',
          titulo: alerta.titulo,
          mensagem: alerta.mensagem,
          lida: alerta.status === 'reconhecido',
          created_at: alerta.created_at,
          dados: alerta.dados_contexto,
          severidade: alerta.severidade,
        });
      });

      // Triagens pendentes
      triagensPendentes?.forEach(triagem => {
        const horasEspera = Math.floor(
          (Date.now() - new Date(triagem.created_at).getTime()) / (1000 * 60 * 60)
        );

        if (horasEspera >= 2) { // Só notificar se esperando há mais de 2 horas
          notifs.push({
            id: `triagem-${triagem.id}`,
            tipo: 'triagem_pendente',
            titulo: 'Triagem Pendente',
            mensagem: `Pedido #${triagem.pedido} (${triagem.produto}) aguardando há ${horasEspera}h`,
            lida: false,
            created_at: triagem.created_at,
            dados: { pedido: triagem.pedido, prioridade: triagem.prioridade },
            severidade: triagem.prioridade === 'urgente' ? 'critical' : 'warning',
          });
        }
      });

      // Recebimentos
      recebimentos?.forEach(rec => {
        notifs.push({
          id: `recebimento-${rec.id}`,
          tipo: 'recebimento',
          titulo: 'Novo Recebimento',
          mensagem: `Material de ${rec.fornecedor} chegou - Pedido #${rec.pedido}`,
          lida: false,
          created_at: rec.created_at,
          dados: { pedido: rec.pedido, fornecedor: rec.fornecedor },
          severidade: 'info',
        });
      });

      // Ordenar por data (mais recentes primeiro)
      notifs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotificacoes(notifs);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotificacoes();

      // Atualizar a cada 60 segundos
      const interval = setInterval(fetchNotificacoes, 60000);

      // Realtime para alertas
      const channel = supabase
        .channel('alertas_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'alertas_historico' },
          () => fetchNotificacoes()
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotificacoes]);

  const marcarComoLida = async (id: string): Promise<boolean> => {
    try {
      // Se for alerta do banco
      if (!id.startsWith('triagem-') && !id.startsWith('recebimento-')) {
        const { error } = await supabase
          .from('alertas_historico')
          .update({ 
            status: 'reconhecido',
            data_reconhecimento: new Date().toISOString(),
            reconhecido_por: user?.id,
          })
          .eq('id', id);

        if (error) throw error;
      }

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );

      return true;
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
      return false;
    }
  };

  const marcarTodasComoLidas = async (): Promise<boolean> => {
    try {
      // Marcar alertas do banco como reconhecidos
      const alertaIds = notificacoes
        .filter(n => !n.lida && !n.id.startsWith('triagem-') && !n.id.startsWith('recebimento-'))
        .map(n => n.id);

      if (alertaIds.length > 0) {
        const { error } = await supabase
          .from('alertas_historico')
          .update({ 
            status: 'reconhecido',
            data_reconhecimento: new Date().toISOString(),
            reconhecido_por: user?.id,
          })
          .in('id', alertaIds);

        if (error) throw error;
      }

      // Atualizar estado local
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));

      return true;
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
      return false;
    }
  };

  const removerNotificacao = async (id: string): Promise<boolean> => {
    try {
      // Se for alerta do banco, marcar como resolvido
      if (!id.startsWith('triagem-') && !id.startsWith('recebimento-')) {
        const { error } = await supabase
          .from('alertas_historico')
          .update({ 
            status: 'resolvido',
            data_resolucao: new Date().toISOString(),
            resolvido_por: user?.id,
          })
          .eq('id', id);

        if (error) throw error;
      }

      // Remover do estado local
      setNotificacoes(prev => prev.filter(n => n.id !== id));

      return true;
    } catch (err) {
      console.error('Erro ao remover notificação:', err);
      return false;
    }
  };

  const limparTodas = async (): Promise<boolean> => {
    try {
      setNotificacoes([]);
      return true;
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
      return false;
    }
  };

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  return {
    notificacoes,
    loading,
    unreadCount,
    refetch: fetchNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    removerNotificacao,
    limparTodas,
  };
}
