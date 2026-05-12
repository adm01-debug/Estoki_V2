import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Notification, NotificationContextType } from "@/types/notifications";
import { useNotificationOperations } from "@/hooks/useNotificationOperations";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import { 
  getTipoSeveridade, 
  playNotificationSound, 
  showNotificationToast 
} from "@/components/notification/notificationHelpers";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const lastNotificationIds = useRef<Set<string>>(new Set());
  
  const {
    permission: pushPermission,
    requestPermission: requestPushPermission,
  } = usePushNotifications();
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const { fetchNotifications, markAsRead: dbMarkAsRead, markAllAsRead: dbMarkAllAsRead } = useNotificationOperations(user);

  useEffect(() => {
    localStorage.setItem('notification-sound-enabled', String(soundEnabled));
  }, [soundEnabled]);

  const loadNotifications = useCallback(async () => {
    const data = await fetchNotifications();
    setNotifications(data);
    lastNotificationIds.current = new Set(data.map(n => n.id));
  }, [fetchNotifications]);

  const handleNewNotification = useCallback((payload: { new?: Record<string, unknown> }) => {
    const newNotif = payload.new;
    if (!newNotif || lastNotificationIds.current.has(String(newNotif.id))) return;

    lastNotificationIds.current.add(String(newNotif.id));

    const notification: Notification = {
      id: String(newNotif.id),
      type: String(newNotif.tipo) as Notification['type'],
      title: String(newNotif.titulo ?? ''),
      message: String(newNotif.mensagem ?? ''),
      read: Boolean(newNotif.lida) || false,
      createdAt: new Date(String(newNotif.created_at)),
      severity: getTipoSeveridade(String(newNotif.tipo)),
      referencia_tipo: newNotif.referencia_tipo as string | undefined,
      referencia_id: newNotif.referencia_id as string | undefined,
    };

    setNotifications(prev => [notification, ...prev]);

    if (soundEnabled) {
      playNotificationSound(notification.severity || 'info');
    }

    showNotificationToast({
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    if (pushPermission === "granted" && "Notification" in window) {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    }
  }, [soundEnabled, pushPermission]);

  useNotificationRealtime(user, handleNewNotification, loadNotifications);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);

    if (soundEnabled) {
      playNotificationSound(notification.severity || 'info');
    }

    showNotificationToast({
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    if (pushPermission === "granted" && "Notification" in window) {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
      });
    }
  }, [pushPermission, soundEnabled]);

  const markAsRead = useCallback(async (id: string) => {
    await dbMarkAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, [dbMarkAsRead]);

  const markAllAsRead = useCallback(async () => {
    const naoLidas = notifications.filter(n => !n.read);
    await dbMarkAllAsRead(naoLidas);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [notifications, dbMarkAllAsRead]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
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
        soundEnabled,
        setSoundEnabled,
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


