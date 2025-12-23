import { useState, useCallback, useRef, useEffect } from 'react';
export function useRefreshToken(refreshFn: () => Promise<string>, expiresIn = 3600000) {
  const [token, setToken] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const refresh = useCallback(async () => { const newToken = await refreshFn(); setToken(newToken); localStorage.setItem('access_token', newToken); timeoutRef.current = setTimeout(refresh, expiresIn - 60000); }, [refreshFn, expiresIn]);
  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);
  return { token, refresh };
}
