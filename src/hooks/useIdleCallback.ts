import { useRef, useCallback, useEffect } from 'react';
export function useIdleCallback(callback: () => void, timeout = 5000) {
  const idleRef = useRef<number>();
  useEffect(() => { if ('requestIdleCallback' in window) { idleRef.current = (window as any).requestIdleCallback(callback, { timeout }); } else { idleRef.current = setTimeout(callback, timeout) as any; } return () => { if ('cancelIdleCallback' in window) { (window as any).cancelIdleCallback(idleRef.current); } else { clearTimeout(idleRef.current); } }; }, [callback, timeout]);
}
