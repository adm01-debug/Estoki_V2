import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface Notification {
  id: string;
  type: "estoque_baixo" | "triagem_pendente" | "info" | "success" | "warning";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
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

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "estoque_baixo",
    title: "Estoque Baixo",
    message: "Caneta BIC Azul - Apenas 15 unidades restantes",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    data: { produto: "Caneta BIC Azul", quantidade: 15 }
  },
  {
    id: "2",
    type: "triagem_pendente",
    title: "Triagem Pendente",
    message: "NF 12345 aguardando triagem há 2 horas",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    data: { nf: "12345" }
  },
  {
    id: "3",
    type: "estoque_baixo",
    title: "Estoque Crítico",
    message: "Chaveiro Metal - Apenas 5 unidades restantes",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    data: { produto: "Chaveiro Metal", quantidade: 5 }
  },
  {
    id: "4",
    type: "triagem_pendente",
    title: "Triagem Atrasada",
    message: "NF 12340 aguardando triagem há 1 dia",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    data: { nf: "12340" }
  }
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Send push notification if permitted
    if (pushPermission === "granted" && "Notification" in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: newNotification.id
      });
    }
  }, [pushPermission]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações push");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === "granted") {
        new Notification("Notificações Ativadas!", {
          body: "Você receberá alertas de estoque baixo e triagens pendentes.",
          icon: "/favicon.ico"
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      return false;
    }
  }, []);

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
        requestPushPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
