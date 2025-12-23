import { useState, useEffect, useCallback } from 'react';
interface FetchState<T> { data: T | null; loading: boolean; error: Error | null; }
export function useFetch<T>(url: string, options?: RequestInit) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const refetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setState({ data, loading: false, error: null });
    } catch (error) { setState({ data: null, loading: false, error: error as Error }); }
  }, [url, options]);
  useEffect(() => { refetch(); }, [refetch]);
  return { ...state, refetch };
}
