import { useState, useCallback, useRef, useEffect } from 'react';

export function useRefreshToken(refreshFn: () => Promise<string>, expiresIn = 3600000) {
  const [token, setToken] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const refresh = useCallback(async () => {
    const newToken = await refreshFn();
    setToken(newToken);
    timeoutRef.current = setTimeout(refresh, Math.max(expiresIn - 60000, 1000));
  }, [refreshFn, expiresIn]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { token, refresh };
}
