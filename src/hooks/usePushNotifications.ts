import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notificações ativadas com sucesso');
        // Show a test notification
        showNotification({
          title: 'Notificações Ativadas',
          body: 'Você receberá alertas de segurança em tempo real.',
          icon: '/favicon.ico',
        });
        return true;
      } else if (result === 'denied') {
        toast.error('Permissão de notificações negada');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erro ao solicitar permissão de notificações');
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback((options: PushNotificationOptions): Notification | null => {
    if (!isSupported || permission !== 'granted') {
      console.log('Cannot show notification: not supported or not permitted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction ?? false,
        data: options.data,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();

        // Navigate to security page if it's a security notification
        if (options.data?.type === 'security') {
          window.location.href = '/seguranca';
        }
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const showSecurityAlert = useCallback((
    type: 'new_device' | 'failed_login' | 'password_change' | 'mfa_change',
    details?: string
  ) => {
    const alertConfig = {
      new_device: {
        title: '🔔 Novo Dispositivo Detectado',
        body: details || 'Um novo dispositivo fez login na sua conta.',
        requireInteraction: true,
      },
      failed_login: {
        title: '⚠️ Tentativa de Login Falha',
        body: details || 'Houve uma tentativa de login incorreta na sua conta.',
        requireInteraction: true,
      },
      password_change: {
        title: '🔐 Senha Alterada',
        body: details || 'A senha da sua conta foi alterada.',
        requireInteraction: true,
      },
      mfa_change: {
        title: '🔒 MFA Atualizado',
        body: details || 'As configurações de autenticação de dois fatores foram alteradas.',
        requireInteraction: true,
      },
    };

    const config = alertConfig[type];

    return showNotification({
      ...config,
      icon: '/favicon.ico',
      tag: `security-${type}-${Date.now()}`,
      data: { type: 'security', alertType: type },
    });
  }, [showNotification]);

  return {
    isSupported,
    permission,
    isEnabled: permission === 'granted',
    requestPermission,
    showNotification,
    showSecurityAlert,
  };
}

export default usePushNotifications;
