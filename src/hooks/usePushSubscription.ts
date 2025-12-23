import { useState, useCallback } from 'react';
export function usePushSubscription() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported] = useState('PushManager' in window);
  const subscribe = useCallback(async (vapidKey: string) => { if (!isSupported) return null; const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey }); setSubscription(sub); return sub; }, [isSupported]);
  const unsubscribe = useCallback(async () => { if (subscription) { await subscription.unsubscribe(); setSubscription(null); } }, [subscription]);
  return { subscription, isSupported, subscribe, unsubscribe };
}
