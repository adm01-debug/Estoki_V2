import { useState, useCallback, useEffect } from 'react';
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  useEffect(() => { if ('Notification' in window) setPermission(Notification.permission); }, []);
  const request = useCallback(async () => { if (!('Notification' in window)) return 'denied'; const result = await Notification.requestPermission(); setPermission(result); return result; }, []);
  const isGranted = permission === 'granted';
  const isDenied = permission === 'denied';
  return { permission, request, isGranted, isDenied };
}
