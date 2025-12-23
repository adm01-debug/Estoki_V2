import { useState, useCallback, useEffect } from 'react';
export function useToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  useEffect(() => { const t = localStorage.getItem('access_token'); setToken(t); if (t) { try { const payload = JSON.parse(atob(t.split('.')[1])); setIsValid(payload.exp * 1000 > Date.now()); } catch { setIsValid(false); } } }, []);
  const save = useCallback((t: string) => { localStorage.setItem('access_token', t); setToken(t); }, []);
  const clear = useCallback(() => { localStorage.removeItem('access_token'); setToken(null); setIsValid(false); }, []);
  return { token, isValid, save, clear };
}
