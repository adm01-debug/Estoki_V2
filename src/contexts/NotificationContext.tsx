import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  type: "estoque_baixo" | "triagem_pendente" | "recebimento" | "alerta" | "info" | "success" | "warning";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
  severity?: "info" | "warning" | "critical";
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  pushPermission: NotificationPermission | "default";
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mapear severidade do banco para o tipo local
const mapSeveridade = (severidade: string): "info" | "warning" | "critical" => {
  switch (severidade) {
    case 'critico':
    case 'urgente':
      return 'critical';
    case 'aviso':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");
  const { user } = useAuth();

  // Buscar notificações do Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Buscar alertas ativos
      const { data: alertas } = await supabase
        .from('alertas_historico')
        .select('*')
        .in('status', ['ativo', 'reconhecido'])
        .order('created_at', { ascending: false })
        .limit(20);

      // Buscar tarefas pendentes como triagens pendentes
      const { data: tarefasPendentes } = await supabase
        .from('tarefas')
        .select('id, tipo, prioridade, created_at, produto_id')
        .in('status', ['pendente', 'em_andamento'])
        .order('created_at', { ascending: true })
        .limit(5);

      // Buscar lotes recebidos recentemente
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);

      const { data: lotesRecentes } = await supabase
        .from('lotes')
        .select('id, numero_lote, fornecedor, created_at')
        .gte('data_recebimento', ontem.toISOString().split('T')[0])
        .limit(5);

      const notifs: Notification[] = [];

      // Processar alertas
      (alertas || []).forEach(alerta => {
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

      // Processar tarefas pendentes
      (tarefasPendentes || []).forEach(tarefa => {
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

      // Processar lotes recentes como recebimentos
      (lotesRecentes || []).forEach(lote => {
        notifs.push({
          id: `lote-${lote.id}`,
          type: "recebimento",
          title: "Novo Recebimento",
          message: `Lote ${lote.numero_lote}${lote.fornecedor ? ` de ${lote.fornecedor}` : ''} recebido`,
          read: false,
          createdAt: new Date(lote.created_at),
          data: { lote: lote.numero_lote, fornecedor: lote.fornecedor },
          severity: "info",
        });
      });

      // Ordenar por data
      notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(notifs);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Atualizar a cada 60 segundos
      const interval = setInterval(fetchNotifications, 60000);

      // Realtime
      const channel = supabase
        .channel('notifications_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas_historico' }, fetchNotifications)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lotes' }, fetchNotifications)
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Push notification se permitido
    if (pushPermission === "granted" && "Notification" in window) {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
      });
    }
  }, [pushPermission]);

  const markAsRead = useCallback(async (id: string) => {
    // Atualizar no banco se for alerta real
    if (!id.startsWith('tarefa-') && !id.startsWith('lote-')) {
      try {
        await supabase
          .from('alertas_historico')
          .update({ 
            status: 'reconhecido',
            data_reconhecimento: new Date().toISOString(),
            reconhecido_por: user?.id,
          })
          .eq('id', id);
      } catch (err) {
        console.error('Erro ao marcar como lida:', err);
      }
    }

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    const alertaIds = notifications
      .filter(n => !n.read && !n.id.startsWith('tarefa-') && !n.id.startsWith('lote-'))
      .map(n => n.id);

    if (alertaIds.length > 0) {
      try {
        await supabase
          .from('alertas_historico')
          .update({ 
            status: 'reconhecido',
            data_reconhecimento: new Date().toISOString(),
            reconhecido_por: user?.id,
          })
          .in('id', alertaIds);
      } catch (err) {
        console.error('Erro ao marcar todas como lidas:', err);
      }
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [notifications, user?.id]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      return permission === "granted";
    } catch {
      return false;
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        pushPermission,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}