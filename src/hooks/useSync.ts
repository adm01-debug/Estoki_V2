import { useState, useCallback, useRef, useEffect } from 'react';
export function useSync<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isSyncing, setIsSyncing] = useState(false);
  const channel = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    channel.current = new BroadcastChannel(`sync-${key}`);
    channel.current.onmessage = (e) => setValue(e.data);
    return () => channel.current?.close();
  }, [key]);
  const sync = useCallback((newValue: T) => { setValue(newValue); channel.current?.postMessage(newValue); }, []);
  return { value, sync, isSyncing };
}
