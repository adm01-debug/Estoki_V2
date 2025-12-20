import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

const getTipoSeveridade = (tipo: string): "info" | "warning" | "critical" => {
  if (tipo.includes('divergencia')) return 'critical';
  if (tipo.includes('chegou')) return 'warning';
  return 'info';
};

// Generate notification sound using Web Audio API
const playNotificationSound = (type: 'info' | 'warning' | 'critical' = 'info') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different types
    const frequencies = {
      info: [523.25, 659.25], // C5, E5 - pleasant chime
      warning: [440, 554.37, 659.25], // A4, C#5, E5 - attention grabbing
      critical: [349.23, 440, 349.23, 440], // F4, A4, F4, A4 - urgent
    };
    
    const freqs = frequencies[type];
    const duration = type === 'critical' ? 0.15 : 0.1;
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    let time = audioContext.currentTime;
    freqs.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, time + i * duration);
    });
    
    const totalDuration = freqs.length * duration;
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + totalDuration);
    
    oscillator.start(time);
    oscillator.stop(time + totalDuration + 0.05);
  } catch (e) {
    console.log('Audio not available');
  }
};

// Show toast notification based on type
const showNotificationToast = (notification: { title: string; message: string; type: string }) => {
  const severity = getTipoSeveridade(notification.type);
  
  if (severity === 'critical' || notification.type.includes('divergencia')) {
    toast.error(notification.title, {
      description: notification.message,
      duration: 8000,
      action: {
        label: "Ver",
        onClick: () => {},
      },
    });
  } else if (severity === 'warning' || notification.type.includes('chegou')) {
    toast.warning(notification.title, {
      description: notification.message,
      duration: 6000,
    });
  } else {
    toast.success(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification-sound-enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const { user } = useAuth();
  const lastNotificationIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('notification-sound-enabled', String(soundEnabled));
  }, [soundEnabled]);

  // Buscar notificações do Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Buscar notificações da nova tabela
      const { data: notificacoesDb } = await supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

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

      const notifs: Notification[] = [];

      // Processar notificações da tabela
      (notificacoesDb || []).forEach(notif => {
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

      // Ordenar por data
      notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(notifs);
      
      // Update tracked IDs for future comparison
      lastNotificationIds.current = new Set(notifs.map(n => n.id));
      isInitialLoad.current = false;
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  }, [user]);

  // Handle new notification from realtime
  const handleNewNotification = useCallback((payload: any) => {
    const newNotif = payload.new;
    if (!newNotif || lastNotificationIds.current.has(newNotif.id)) return;

    // Add to tracked IDs
    lastNotificationIds.current.add(newNotif.id);

    const notification: Notification = {
      id: newNotif.id,
      type: newNotif.tipo as Notification['type'],
      title: newNotif.titulo,
      message: newNotif.mensagem,
      read: newNotif.lida || false,
      createdAt: new Date(newNotif.created_at),
      severity: getTipoSeveridade(newNotif.tipo),
      referencia_tipo: newNotif.referencia_tipo,
      referencia_id: newNotif.referencia_id,
    };

    // Add to state
    setNotifications(prev => [notification, ...prev]);

    // Play sound
    if (soundEnabled) {
      playNotificationSound(notification.severity || 'info');
    }

    // Show toast
    showNotificationToast({
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    // Push notification if permitted
    if (pushPermission === "granted" && "Notification" in window) {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    }
  }, [soundEnabled, pushPermission]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Atualizar a cada 60 segundos
      const interval = setInterval(fetchNotifications, 60000);

      // Realtime for new notifications
      const notifChannel = supabase
        .channel('realtime_notificacoes')
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notificacoes' }, 
          handleNewNotification
        )
        .subscribe();

      // Realtime for alerts
      const alertChannel = supabase
        .channel('realtime_alertas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas_historico' }, fetchNotifications)
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(notifChannel);
        supabase.removeChannel(alertChannel);
      };
    }
  }, [user, fetchNotifications, handleNewNotification]);

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

    // Play sound
    if (soundEnabled) {
      playNotificationSound(notification.severity || 'info');
    }

    // Show toast
    showNotificationToast({
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    // Push notification se permitido
    if (pushPermission === "granted" && "Notification" in window) {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
      });
    }
  }, [pushPermission, soundEnabled]);

  const markAsRead = useCallback(async (id: string) => {
    // Atualizar no banco se for alerta real
    if (!id.startsWith('tarefa-') && !id.startsWith('lote-')) {
      try {
        // Try notificacoes table first
        const { error: notifError } = await supabase
          .from('notificacoes')
          .update({ lida: true, data_leitura: new Date().toISOString() })
          .eq('id', id);
        
        if (notifError) {
          // Try alertas_historico
          await supabase
            .from('alertas_historico')
            .update({ 
              status: 'reconhecido',
              data_reconhecimento: new Date().toISOString(),
              reconhecido_por: user?.id,
            })
            .eq('id', id);
        }
      } catch (err) {
        console.error('Erro ao marcar como lida:', err);
      }
    }

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    const naoLidas = notifications.filter(n => !n.read);
    
    const alertaIds = naoLidas
      .filter(n => n.type === 'alerta')
      .map(n => n.id);
    
    const notifIds = naoLidas
      .filter(n => n.type !== 'alerta' && !n.id.startsWith('tarefa-'))
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
        console.error('Erro ao marcar alertas como lidos:', err);
      }
    }

    if (notifIds.length > 0) {
      try {
        await supabase
          .from('notificacoes')
          .update({ lida: true, data_leitura: new Date().toISOString() })
          .in('id', notifIds);
      } catch (err) {
        console.error('Erro ao marcar notificações como lidas:', err);
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
