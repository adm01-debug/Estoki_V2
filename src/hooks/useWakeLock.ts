import { useState, useCallback, useEffect } from 'react';
export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<any>(null);
  const request = useCallback(async () => {
    try { const lock = await (navigator as any).wakeLock.request('screen'); setWakeLock(lock); } catch {}
  }, []);
  const release = useCallback(async () => { await wakeLock?.release(); setWakeLock(null); }, [wakeLock]);
  useEffect(() => () => { wakeLock?.release(); }, [wakeLock]);
  return { isLocked: !!wakeLock, request, release };
}
