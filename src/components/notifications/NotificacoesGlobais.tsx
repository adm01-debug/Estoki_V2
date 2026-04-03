import { useEffect, useRef } from "react";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";
import { Bell, AlertTriangle, CheckCircle, Info, Package, ClipboardCheck } from "lucide-react";

interface NotificacoesGlobaisProps {
  enabled?: boolean;
  enablePush?: boolean;
}

export function NotificacoesGlobais({ enabled = true, enablePush = true }: NotificacoesGlobaisProps) {
  const { notificacoes, marcarComoLida } = useNotificacoes();
  const { permission, isSupported, requestPermission, showNotification } = usePushNotifications();
  const notificadasRef = useRef<Set<string>>(new Set());
  const pushNotificadasRef = useRef<Set<string>>(new Set());

  // Solicitar permissão de push notification ao montar
  useEffect(() => {
    if (enablePush && isSupported && permission === 'default') {
      requestPermission();
    }
  }, [enablePush, isSupported, permission, requestPermission]);

  // Mostrar toast e push notification para novas notificações não lidas
  useEffect(() => {
    if (!enabled) return;
    
    const notificacoesRecentes = notificacoes
      .filter(n => !n.lida)
      .filter(n => !notificadasRef.current.has(n.id))
      .filter(n => {
        const criada = new Date(n.created_at);
        const agora = new Date();
        const diffMinutos = (agora.getTime() - criada.getTime()) / (1000 * 60);
        return diffMinutos < 5; // Apenas notificações dos últimos 5 minutos
      });

    notificacoesRecentes.forEach(notif => {
      notificadasRef.current.add(notif.id);
      
      // Push notification nativa (se habilitado e permitido)
      if (enablePush && permission === 'granted' && !pushNotificadasRef.current.has(notif.id)) {
        pushNotificadasRef.current.add(notif.id);
        showNotification(notif.titulo, {
          body: notif.mensagem,
          icon: '/icon-192.png',
          badge: '/icon-72.png',
          tag: notif.id,
          data: { notificationId: notif.id, tipo: notif.tipo }
        });
      }
      
      // Toast notification (sempre)
      const tipo = getTipoToast(notif.severidade);
      
      if (tipo === 'error') {
        toast.error(notif.titulo, {
          description: notif.mensagem,
          duration: 8000,
          action: {
            label: "Marcar como lida",
            onClick: () => marcarComoLida(notif.id),
          },
        });
      } else if (tipo === 'warning') {
        toast.warning(notif.titulo, {
          description: notif.mensagem,
          duration: 6000,
          action: {
            label: "Marcar como lida",
            onClick: () => marcarComoLida(notif.id),
          },
        });
      } else if (tipo === 'success') {
        toast.success(notif.titulo, {
          description: notif.mensagem,
          duration: 4000,
        });
      } else {
        toast.info(notif.titulo, {
          description: notif.mensagem,
          duration: 5000,
          action: {
            label: "Ver",
            onClick: () => marcarComoLida(notif.id),
          },
        });
      }
    });
  }, [notificacoes, enabled, enablePush, permission, marcarComoLida, showNotification]);

  return null; // Componente invisível - apenas gerencia toasts e push
}

function getTipoToast(severidade?: 'info' | 'warning' | 'critical'): 'info' | 'warning' | 'error' | 'success' {
  switch (severidade) {
    case 'critical':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
}

export default NotificacoesGlobais;
