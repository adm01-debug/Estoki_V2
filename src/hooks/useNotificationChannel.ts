import { useState, useCallback } from 'react';
interface NotificationChannel { id: string; name: string; enabled: boolean; }
export function useNotificationChannel() {
  const [channels, setChannels] = useState<NotificationChannel[]>([{ id: 'push', name: 'Push', enabled: true }, { id: 'email', name: 'Email', enabled: true }, { id: 'sms', name: 'SMS', enabled: false }]);
  const toggle = useCallback((id: string) => setChannels(c => c.map(ch => ch.id === id ? { ...ch, enabled: !ch.enabled } : ch)), []);
  const enable = useCallback((id: string) => setChannels(c => c.map(ch => ch.id === id ? { ...ch, enabled: true } : ch)), []);
  const disable = useCallback((id: string) => setChannels(c => c.map(ch => ch.id === id ? { ...ch, enabled: false } : ch)), []);
  return { channels, toggle, enable, disable };
}
