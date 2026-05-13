import { useState, useCallback } from 'react';
export function useAsyncCallback<T, P extends unknown[]>(callback: (...args: P) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const execute = useCallback(async (...args: P) => {
    setLoading(true);
    setError(null);
    try { const result = await callback(...args); setData(result); return result; }
    catch (e) { setError(e as Error); throw e; }
    finally { setLoading(false); }
  }, [callback]);
  return { execute, loading, error, data };
}
