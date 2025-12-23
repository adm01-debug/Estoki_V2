import { useState, useEffect, useCallback, useRef } from 'react';
export function useSWR<T>(key: string, fetcher: () => Promise<T>, options?: { revalidateOnFocus?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const cache = useRef<Map<string, T>>(new Map());
  const revalidate = useCallback(async () => {
    setIsValidating(true);
    try { const result = await fetcher(); cache.current.set(key, result); setData(result); }
    catch (e) { setError(e as Error); }
    finally { setIsValidating(false); }
  }, [key, fetcher]);
  useEffect(() => { if (cache.current.has(key)) setData(cache.current.get(key)!); revalidate(); }, [key]);
  return { data, error, isValidating, mutate: setData, revalidate };
}
