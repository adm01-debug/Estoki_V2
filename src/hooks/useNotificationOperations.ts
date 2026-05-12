import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notifications";
import { mapSeveridade, getTipoSeveridade } from "@/components/notification/notificationHelpers";

export function useNotificationOperations(user: { id: string } | null) {
  const fetchNotifications = useCallback(async () => {
    if (!user) return [];

    try {
      const [notifResult, alertResult, taskResult] = await Promise.all([
        supabase
          .from('notificacoes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('alertas_historico')
          .select('*')
          .in('status', ['ativo', 'reconhecido'])
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('tarefas')
          .select('id, tipo, prioridade, created_at, produto_id')
          .in('status', ['pendente', 'em_andamento'])
          .order('created_at', { ascending: true })
          .limit(5)
      ]);

      const notifs: Notification[] = [];

      // Process notifications
      (notifResult.data || []).forEach(notif => {
        notifs.push({
          id: notif.id,
          type: notif.tipo as Notification['type'],
          title: notif.titulo,
          message: notif.mensagem,
          read: notif.lida,
          createdAt: new Date(notif.created_at),
          severity: getTipoSeveridade(notif.tipo),
          referencia_tipo: notif.referencia_tipo || undefined,
          referencia_id: notif.referencia_id || undefined,
        });
      });

      // Process alerts
      (alertResult.data || []).forEach(alerta => {
        notifs.push({
          id: alerta.id,
          type: "alerta",
          title: alerta.titulo,
          message: alerta.mensagem,
          read: alerta.status === 'reconhecido',
          createdAt: new Date(alerta.created_at),
          data: typeof alerta.dados_contexto === 'object' && alerta.dados_contexto !== null 
            ? alerta.dados_contexto as Record<string, unknown>
            : {},
          severity: mapSeveridade(alerta.severidade),
        });
      });

      // Process pending tasks
      (taskResult.data || []).forEach(tarefa => {
        const horasEspera = Math.floor(
          (Date.now() - new Date(tarefa.created_at).getTime()) / (1000 * 60 * 60)
        );

        if (horasEspera >= 2) {
          notifs.push({
            id: `tarefa-${tarefa.id}`,
            type: "triagem_pendente",
            title: "Tarefa Pendente",
            message: `Tarefa ${tarefa.tipo} aguardando há ${horasEspera}h`,
            read: false,
            createdAt: new Date(tarefa.created_at),
            data: { tipo: tarefa.tipo, prioridade: tarefa.prioridade },
            severity: tarefa.prioridade === 'urgente' ? 'critical' : 'warning',
          });
        }
      });

      return notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao buscar notificações:', err);
      return [];
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;
    
    if (!id.startsWith('tarefa-') && !id.startsWith('lote-')) {
      try {
        const { error: notifError } = await supabase
          .from('notificacoes')
          .update({ lida: true, data_leitura: new Date().toISOString() })
          .eq('id', id);
        
        if (notifError) {
          await supabase
            .from('alertas_historico')
            .update({ 
              status: 'reconhecido',
              data_reconhecimento: new Date().toISOString(),
              reconhecido_por: user.id,
            })
            .eq('id', id);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Erro ao marcar como lida:', err);
      }
    }
  }, [user]);

  const markAllAsRead = useCallback(async (naoLidas: Notification[]) => {
    if (!user) return;

    const alertaIds = naoLidas
      .filter(n => n.type === 'alerta')
      .map(n => n.id);
    
    const notifIds = naoLidas
      .filter(n => n.type !== 'alerta' && !n.id.startsWith('tarefa-'))
      .map(n => n.id);

    const promises = [];
    
    if (alertaIds.length > 0) {
      promises.push(
        supabase
          .from('alertas_historico')
          .update({ 
            status: 'reconhecido',
            data_reconhecimento: new Date().toISOString(),
            reconhecido_por: user.id,
          })
          .in('id', alertaIds)
      );
    }

    if (notifIds.length > 0) {
      promises.push(
        supabase
          .from('notificacoes')
          .update({ lida: true, data_leitura: new Date().toISOString() })
          .in('id', notifIds)
      );
    }

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Erro ao marcar tudo como lido:', err);
      }
    }
  }, [user]);

  return { fetchNotifications, markAsRead, markAllAsRead };
}