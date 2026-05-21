import { useEffect, useCallback, useRef } from 'react';
export function useRefreshOnFocus(callback: () => void) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;
  useEffect(() => {
    const handler = () => { if (document.visibilityState === 'visible') savedCallback.current(); };
    const focusHandler = () => savedCallback.current();
    document.addEventListener('visibilitychange', handler);
    window.addEventListener('focus', focusHandler);
    return () => { document.removeEventListener('visibilitychange', handler); window.removeEventListener('focus', focusHandler); };
  }, []);
}
