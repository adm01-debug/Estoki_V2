import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { getTipoSeveridade, mapSeveridade, playNotificationSound, showNotificationToast } from "@/components/notification/notificationHelpers";

export interface Notification {
  id: string;
  type: "estoque_baixo" | "triagem_pendente" | "recebimento" | "recebimento_chegou" | "recebimento_divergencia" | "recebimento_conferido" | "alerta" | "info" | "success" | "warning";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
  severity?: "info" | "warning" | "critical";
  referencia_tipo?: string;
  referencia_id?: string;
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
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { permission: pushPermission, requestPermission: requestPushFromHook } = usePushNotifications();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const { user } = useAuth();
  const lastNotificationIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => { localStorage.setItem('notification-sound-enabled', String(soundEnabled)); }, [soundEnabled]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data: notificacoesDb } = await supabase.from('notificacoes').select('*').order('created_at', { ascending: false }).limit(30);
      const { data: alertas } = await supabase.from('alertas_historico').select('*').in('status', ['ativo', 'reconhecido']).order('created_at', { ascending: false }).limit(20);
      const { data: tarefasPendentes } = await supabase.from('tarefas').select('id, tipo, prioridade, created_at, produto_id').in('status', ['pendente', 'em_andamento']).order('created_at', { ascending: true }).limit(5);

      const notifs: Notification[] = [];
      (notificacoesDb || []).forEach(notif => {
        notifs.push({ id: notif.id, type: notif.tipo as Notification['type'], title: notif.titulo, message: notif.mensagem, read: notif.lida, createdAt: new Date(notif.created_at), severity: getTipoSeveridade(notif.tipo), referencia_tipo: notif.referencia_tipo || undefined, referencia_id: notif.referencia_id || undefined });
      });
      (alertas || []).forEach(alerta => {
        notifs.push({ id: alerta.id, type: "alerta", title: alerta.titulo, message: alerta.mensagem, read: alerta.status === 'reconhecido', createdAt: new Date(alerta.created_at), data: typeof alerta.dados_contexto === 'object' && alerta.dados_contexto !== null ? alerta.dados_contexto as Record<string, unknown> : {}, severity: mapSeveridade(alerta.severidade) });
      });
      (tarefasPendentes || []).forEach(tarefa => {
        const horasEspera = Math.floor((Date.now() - new Date(tarefa.created_at).getTime()) / (1000 * 60 * 60));
        if (horasEspera >= 2) {
          notifs.push({ id: `tarefa-${tarefa.id}`, type: "triagem_pendente", title: "Tarefa Pendente", message: `Tarefa ${tarefa.tipo} aguardando há ${horasEspera}h`, read: false, createdAt: new Date(tarefa.created_at), data: { tipo: tarefa.tipo, prioridade: tarefa.prioridade }, severity: tarefa.prioridade === 'urgente' ? 'critical' : 'warning' });
        }
      });
      notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setNotifications(notifs);
      lastNotificationIds.current = new Set(notifs.map(n => n.id));
      isInitialLoad.current = false;
    } catch (err) { if (import.meta.env.DEV) console.error('Erro ao buscar notificações:', err); }
  }, [user]);

  const handleNewNotification = useCallback((payload: { new?: Record<string, unknown> }) => {
    const newNotif = payload.new;
    if (!newNotif || lastNotificationIds.current.has(String(newNotif.id))) return;
    lastNotificationIds.current.add(String(newNotif.id));
    const notification: Notification = { id: String(newNotif.id), type: String(newNotif.tipo) as Notification['type'], title: String(newNotif.titulo ?? ''), message: String(newNotif.mensagem ?? ''), read: Boolean(newNotif.lida) || false, createdAt: new Date(String(newNotif.created_at)), severity: getTipoSeveridade(String(newNotif.tipo)), referencia_tipo: newNotif.referencia_tipo as string | undefined, referencia_id: newNotif.referencia_id as string | undefined };
    setNotifications(prev => [notification, ...prev]);
    if (soundEnabled) playNotificationSound(notification.severity || 'info');
    showNotificationToast({ title: notification.title, message: notification.message, type: notification.type });
    if (pushPermission === "granted" && "Notification" in window) new window.Notification(notification.title, { body: notification.message, icon: "/favicon.ico", tag: notification.id });
  }, [soundEnabled, pushPermission]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      const notifChannel = supabase.channel('realtime_notificacoes').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes' }, handleNewNotification).subscribe();
      const alertChannel = supabase.channel('realtime_alertas').on('postgres_changes', { event: '*', schema: 'public', table: 'alertas_historico' }, fetchNotifications).subscribe();
      return () => { clearInterval(interval); supabase.removeChannel(notifChannel); supabase.removeChannel(alertChannel); };
    }
  }, [user, fetchNotifications, handleNewNotification]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    const newNotification: Notification = { ...notification, id: crypto.randomUUID(), read: false, createdAt: new Date() };
    setNotifications(prev => [newNotification, ...prev]);
    if (soundEnabled) playNotificationSound(notification.severity || 'info');
    showNotificationToast({ title: notification.title, message: notification.message, type: notification.type });
    if (pushPermission === "granted" && "Notification" in window) new window.Notification(notification.title, { body: notification.message, icon: "/favicon.ico" });
  }, [pushPermission, soundEnabled]);

  const markAsRead = useCallback(async (id: string) => {
    if (!id.startsWith('tarefa-') && !id.startsWith('lote-')) {
      try {
        const { error: notifError } = await supabase.from('notificacoes').update({ lida: true, data_leitura: new Date().toISOString() }).eq('id', id);
        if (notifError) await supabase.from('alertas_historico').update({ status: 'reconhecido', data_reconhecimento: new Date().toISOString(), reconhecido_por: user?.id }).eq('id', id);
      } catch (err) { if (import.meta.env.DEV) console.error('Erro ao marcar como lida:', err); }
    }
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    const naoLidas = notifications.filter(n => !n.read);
    const alertaIds = naoLidas.filter(n => n.type === 'alerta').map(n => n.id);
    const notifIds = naoLidas.filter(n => n.type !== 'alerta' && !n.id.startsWith('tarefa-')).map(n => n.id);
    if (alertaIds.length > 0) { try { await supabase.from('alertas_historico').update({ status: 'reconhecido', data_reconhecimento: new Date().toISOString(), reconhecido_por: user?.id }).in('id', alertaIds); } catch {} }
    if (notifIds.length > 0) { try { await supabase.from('notificacoes').update({ lida: true, data_leitura: new Date().toISOString() }).in('id', notifIds); } catch {} }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [notifications, user?.id]);

  const removeNotification = useCallback((id: string) => { setNotifications(prev => prev.filter(n => n.id !== id)); }, []);
  const clearAll = useCallback(() => { setNotifications([]); }, []);
  const requestPushPermission = useCallback(async (): Promise<boolean> => await requestPushFromHook(), [requestPushFromHook]);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll, pushPermission, requestPushPermission, soundEnabled, setSoundEnabled }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
}
