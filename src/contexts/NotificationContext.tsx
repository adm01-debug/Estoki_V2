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

      // Buscar triagens pendentes
      const { data: triagensPendentes } = await supabase
        .from('triagens')
        .select('id, pedido, produto, prioridade, created_at')
        .eq('status', 'aguardando')
        .order('created_at', { ascending: true })
        .limit(5);

      // Buscar recebimentos recentes
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);

      const { data: recebimentos } = await supabase
        .from('recebimentos')
        .select('id, pedido, fornecedor, status, created_at')
        .eq('status', 'chegou')
        .gte('created_at', ontem.toISOString())
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
          data: alerta.dados_contexto,
          severity: alerta.severidade,
        });
      });

      // Processar triagens pendentes
      (triagensPendentes || []).forEach(triagem => {
        const horasEspera = Math.floor(
          (Date.now() - new Date(triagem.created_at).getTime()) / (1000 * 60 * 60)
        );

        if (horasEspera >= 2) {
          notifs.push({
            id: `triagem-${triagem.id}`,
            type: "triagem_pendente",
            title: "Triagem Pendente",
            message: `Pedido #${triagem.pedido} (${triagem.produto}) aguardando há ${horasEspera}h`,
            read: false,
            createdAt: new Date(triagem.created_at),
            data: { pedido: triagem.pedido, prioridade: triagem.prioridade },
            severity: triagem.prioridade === 'urgente' ? 'critical' : 'warning',
          });
        }
      });

      // Processar recebimentos
      (recebimentos || []).forEach(rec => {
        notifs.push({
          id: `recebimento-${rec.id}`,
          type: "recebimento",
          title: "Novo Recebimento",
          message: `Material de ${rec.fornecedor} chegou - Pedido #${rec.pedido}`,
          read: false,
          createdAt: new Date(rec.created_at),
          data: { pedido: rec.pedido, fornecedor: rec.fornecedor },
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
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'recebimentos' }, fetchNotifications)
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
    if (!id.startsWith('triagem-') && !id.startsWith('recebimento-')) {
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
      .filter(n => !n.read && !n.id.startsWith('triagem-') && !n.id.startsWith('recebimento-'))
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
