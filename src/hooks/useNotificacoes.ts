import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TipoNotificacao = 
  | 'estoque_baixo' 
  | 'triagem_pendente' 
  | 'recebimento' 
  | 'recebimento_chegou'
  | 'recebimento_divergencia'
  | 'recebimento_conferido'
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
  referencia_tipo?: string;
  referencia_id?: string;
}

function mapSeveridade(dbSeveridade: string | null): 'info' | 'warning' | 'critical' {
  switch (dbSeveridade) {
    case 'critico':
    case 'urgente':
      return 'critical';
    case 'aviso':
      return 'warning';
    default:
      return 'info';
  }
}

function getTipoSeveridade(tipo: string): 'info' | 'warning' | 'critical' {
  if (tipo.includes('divergencia')) return 'critical';
  if (tipo.includes('chegou')) return 'warning';
  return 'info';
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotificacoes = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar notificações da tabela notificacoes
      const { data: notifs, error: notifsError } = await supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifsError) {
        if (import.meta.env.DEV) console.error('Erro ao buscar notificações:', notifsError);
      }

      // Buscar alertas ativos do sistema
      const { data: alertas, error: alertasError } = await supabase
        .from('alertas_historico')
        .select('id, titulo, mensagem, status, created_at, dados_contexto, severidade')
        .in('status', ['ativo', 'reconhecido'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertasError) {
        if (import.meta.env.DEV) console.error('Erro ao buscar alertas:', alertasError);
      }

      const allNotifs: Notificacao[] = [];

      // Notificações da tabela notificacoes
      (notifs || []).forEach(notif => {
        allNotifs.push({
          id: notif.id,
          tipo: notif.tipo as TipoNotificacao,
          titulo: notif.titulo,
          mensagem: notif.mensagem,
          lida: notif.lida,
          created_at: notif.created_at,
          severidade: getTipoSeveridade(notif.tipo),
          referencia_tipo: notif.referencia_tipo || undefined,
          referencia_id: notif.referencia_id || undefined,
        });
      });

      // Alertas do sistema
      (alertas || []).forEach(alerta => {
        const dadosContexto = alerta.dados_contexto;
        const dados: Record<string, unknown> = typeof dadosContexto === 'object' && dadosContexto !== null 
          ? dadosContexto as Record<string, unknown>
          : {};
        
        allNotifs.push({
          id: alerta.id,
          tipo: 'alerta',
          titulo: alerta.titulo,
          mensagem: alerta.mensagem,
          lida: alerta.status === 'reconhecido',
          created_at: alerta.created_at,
          dados,
          severidade: mapSeveridade(alerta.severidade),
        });
      });

      // Ordenar por data
      allNotifs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotificacoes(allNotifs);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotificacoes();

      const interval = setInterval(fetchNotificacoes, 60000);

      // Realtime para notificações
      const notifChannel = supabase
        .channel('notificacoes_changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notificacoes' },
          () => fetchNotificacoes()
        )
        .subscribe();

      // Realtime para alertas
      const alertaChannel = supabase
        .channel('alertas_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'alertas_historico' },
          () => fetchNotificacoes()
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(notifChannel);
        supabase.removeChannel(alertaChannel);
      };
    }
  }, [user, fetchNotificacoes]);

  const marcarComoLida = async (id: string): Promise<boolean> => {
    try {
      // Verificar se é notificação ou alerta
      const notif = notificacoes.find(n => n.id === id);
      
      if (notif?.tipo === 'alerta') {
        const { error } = await supabase
          .from('alertas_historico')
          .update({ 
            status: 'reconhecido',
            data_reconhecimento: new Date().toISOString(),
            reconhecido_por: user?.id,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notificacoes')
          .update({ 
            lida: true,
            data_leitura: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
      }

      setNotificacoes(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );

      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao marcar como lida:', err);
      return false;
    }
  };

  const marcarTodasComoLidas = async (): Promise<boolean> => {
    try {
      const naoLidas = notificacoes.filter(n => !n.lida);
      
      const alertaIds = naoLidas.filter(n => n.tipo === 'alerta').map(n => n.id);
      const notifIds = naoLidas.filter(n => n.tipo !== 'alerta').map(n => n.id);

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

      if (notifIds.length > 0) {
        const { error } = await supabase
          .from('notificacoes')
          .update({ 
            lida: true,
            data_leitura: new Date().toISOString(),
          })
          .in('id', notifIds);

        if (error) throw error;
      }

      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));

      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao marcar todas como lidas:', err);
      return false;
    }
  };

  const removerNotificacao = async (id: string): Promise<boolean> => {
    try {
      const notif = notificacoes.find(n => n.id === id);
      
      if (notif?.tipo === 'alerta') {
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
      // Notificações regulares não são deletadas, apenas marcadas como lidas

      setNotificacoes(prev => prev.filter(n => n.id !== id));

      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao remover notificação:', err);
      return false;
    }
  };

  const limparTodas = async (): Promise<boolean> => {
    try {
      setNotificacoes([]);
      return true;
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao limpar notificações:', err);
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
