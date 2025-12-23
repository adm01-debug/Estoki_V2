import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = useCallback((type: string, payload: any) => {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
    };
    setPendingActions(prev => [...prev, action]);
    localStorage.setItem('offline_actions', JSON.stringify([...pendingActions, action]));
  }, [pendingActions]);

  const syncActions = useCallback(async (syncFn: (action: OfflineAction) => Promise<void>) => {
    for (const action of pendingActions) {
      await syncFn(action);
    }
    setPendingActions([]);
    localStorage.removeItem('offline_actions');
  }, [pendingActions]);

  return { isOnline, pendingActions, queueAction, syncActions };
}

export default useOffline;
