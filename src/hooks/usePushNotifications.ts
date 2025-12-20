import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          console.log('Service Worker registered');
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (
    title: string, 
    options?: NotificationOptions & { vibrate?: number[] }
  ) => {
    if (permission !== 'granted' || !registration) return;

    try {
      const notificationOptions: NotificationOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      };
      await registration.showNotification(title, notificationOptions);
    } catch (err) {
      console.error('Failed to show notification:', err);
    }
  }, [permission, registration]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    registration,
  };
}
