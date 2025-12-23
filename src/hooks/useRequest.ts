import { useState, useCallback } from 'react';
export function useRequest<T, P extends any[]>(fn: (...args: P) => Promise<T>) {
  const [state, setState] = useState<{ loading: boolean; data: T | null; error: Error | null }>({ loading: false, data: null, error: null });
  const run = useCallback(async (...args: P) => {
    setState(s => ({ ...s, loading: true }));
    try { const data = await fn(...args); setState({ loading: false, data, error: null }); return data; }
    catch (error) { setState({ loading: false, data: null, error: error as Error }); throw error; }
  }, [fn]);
  return { ...state, run };
}
