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

export interface NotificationContextType {
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