/**
 * Hook de Notificações e Toast
 * Sistema unificado de notificações com persistência
 */

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipos
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

export interface NotificationActions {
  // Toast (efêmero)
  showToast: (options: ToastOptions) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  
  // Persistentes
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Refresh
  refresh: () => Promise<void>;
}

interface ToastOptions {
  type?: NotificationType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Hook principal
export function useNotifications(userId?: string): NotificationState & NotificationActions {
  const { toast } = useToast();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
  });

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifications = data || [];
      const unreadCount = notifications.filter(n => !n.read).length;

      setState({
        notifications,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      console.error('[Notifications] Error loading:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  // Inicialização e real-time
  useEffect(() => {
    loadNotifications();

    if (!userId) return;

    // Subscription real-time
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          setState(prev => ({
            notifications: [newNotification, ...prev.notifications],
            unreadCount: prev.unreadCount + 1,
            isLoading: false,
          }));

          // Mostrar toast para notificações urgentes
          if (newNotification.priority === 'urgent' || newNotification.priority === 'high') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.type === 'error' ? 'destructive' : 'default',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadNotifications, toast]);

  // Toast efêmero
  const showToast = useCallback((options: ToastOptions) => {
    toast({
      title: options.title,
      description: options.description,
      variant: options.type === 'error' ? 'destructive' : 'default',
      duration: options.duration || 5000,
      action: options.action ? (
        <button onClick={options.action.onClick} className="text-sm font-medium">
          {options.action.label}
        </button>
      ) : undefined,
    });
  }, [toast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, description: message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, description: message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, description: message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, description: message });
  }, [showToast]);

  // Adicionar notificação persistente
  const addNotification = useCallback(async (
    notification: Omit<Notification, 'id' | 'read' | 'created_at'>
  ) => {
    if (!userId) return;

    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        ...notification,
        read: false,
      });
    } catch (error) {
      console.error('[Notifications] Error adding:', error);
    }
  }, [userId]);

  // Marcar como lida
  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      console.error('[Notifications] Error marking as read:', error);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('[Notifications] Error marking all as read:', error);
    }
  }, [userId]);

  // Deletar notificação
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);

      setState(prev => {
        const notification = prev.notifications.find(n => n.id === id);
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id),
          unreadCount: notification && !notification.read
            ? prev.unreadCount - 1
            : prev.unreadCount,
        };
      });
    } catch (error) {
      console.error('[Notifications] Error deleting:', error);
    }
  }, []);

  // Limpar todas
  const clearAll = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase.from('notifications').delete().eq('user_id', userId);
      setState({ notifications: [], unreadCount: 0, isLoading: false });
    } catch (error) {
      console.error('[Notifications] Error clearing:', error);
    }
  }, [userId]);

  return {
    ...state,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: loadNotifications,
  };
}

// Context
const NotificationContext = createContext<(NotificationState & NotificationActions) | null>(null);

export const NotificationProvider: React.FC<{ 
  userId?: string;
  children: React.ReactNode;
}> = ({ userId, children }) => {
  const notifications = useNotifications(userId);
  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
};

export default useNotifications;
