/**
 * Hook de Notificações e Toast
 * Usa tabela 'notificacoes' do banco
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  created_at: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

export interface NotificationActions {
  showToast: (options: ToastOptions) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface ToastOptions {
  type?: NotificationType;
  title: string;
  description?: string;
  duration?: number;
}

function mapDbRow(row: any): Notification {
  return {
    id: row.id,
    type: row.tipo || 'info',
    title: row.titulo || '',
    message: row.mensagem || '',
    priority: 'normal',
    read: row.lida ?? false,
    created_at: row.created_at,
  };
}

export function useNotifications(userId?: string): NotificationState & NotificationActions {
  const { toast } = useToast();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
  });

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const notifications = (data || []).map(mapDbRow);
      setState({ notifications, unreadCount: notifications.filter(n => !n.read).length, isLoading: false });
    } catch (error) {
      console.error('[Notifications] Error loading:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    if (!userId) return;
    const channel = supabase
      .channel(`notificacoes:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificacoes', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = mapDbRow(payload.new);
          setState(prev => ({ notifications: [n, ...prev.notifications], unreadCount: prev.unreadCount + 1, isLoading: false }));
          if (n.priority === 'urgent' || n.priority === 'high') {
            toast({ title: n.title, description: n.message, variant: n.type === 'error' ? 'destructive' : 'default' });
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, loadNotifications, toast]);

  const showToast = useCallback((options: ToastOptions) => {
    toast({ title: options.title, description: options.description, variant: options.type === 'error' ? 'destructive' : 'default', duration: options.duration || 5000 });
  }, [toast]);

  const showSuccess = useCallback((t: string, m?: string) => showToast({ type: 'success', title: t, description: m }), [showToast]);
  const showError = useCallback((t: string, m?: string) => showToast({ type: 'error', title: t, description: m }), [showToast]);
  const showWarning = useCallback((t: string, m?: string) => showToast({ type: 'warning', title: t, description: m }), [showToast]);
  const showInfo = useCallback((t: string, m?: string) => showToast({ type: 'info', title: t, description: m }), [showToast]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    if (!userId) return;
    try {
      await supabase.from('notificacoes').insert({
        user_id: userId,
        titulo: notification.title,
        mensagem: notification.message,
        tipo: notification.type,
        lida: false,
      });
    } catch (error) {
      console.error('[Notifications] Error adding:', error);
    }
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase.from('notificacoes').update({ lida: true, data_leitura: new Date().toISOString() }).eq('id', id);
      setState(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n), unreadCount: Math.max(0, prev.unreadCount - 1) }));
    } catch (error) { console.error('[Notifications] Error:', error); }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      await supabase.from('notificacoes').update({ lida: true, data_leitura: new Date().toISOString() }).eq('user_id', userId).eq('lida', false);
      setState(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 }));
    } catch (error) { console.error('[Notifications] Error:', error); }
  }, [userId]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await supabase.from('notificacoes').delete().eq('id', id);
      setState(prev => {
        const n = prev.notifications.find(x => x.id === id);
        return { ...prev, notifications: prev.notifications.filter(x => x.id !== id), unreadCount: n && !n.read ? prev.unreadCount - 1 : prev.unreadCount };
      });
    } catch (error) { console.error('[Notifications] Error:', error); }
  }, []);

  const clearAll = useCallback(async () => {
    if (!userId) return;
    try {
      await supabase.from('notificacoes').delete().eq('user_id', userId);
      setState({ notifications: [], unreadCount: 0, isLoading: false });
    } catch (error) { console.error('[Notifications] Error:', error); }
  }, [userId]);

  return { ...state, showToast, showSuccess, showError, showWarning, showInfo, addNotification, markAsRead, markAllAsRead, deleteNotification, clearAll, refresh: loadNotifications };
}

const NotificationContext = createContext<(NotificationState & NotificationActions) | null>(null);

export const NotificationProvider: React.FC<{ userId?: string; children: React.ReactNode }> = ({ userId, children }) => {
  const notifications = useNotifications(userId);
  return <NotificationContext.Provider value={notifications}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
};

export default useNotifications;
