import { useCallback, useState } from 'react';
export function usePromise<T>() {
  const [state, setState] = useState<{ loading: boolean; data: T | null; error: Error | null }>({ loading: false, data: null, error: null });
  const execute = useCallback(async (promise: Promise<T>) => {
    setState({ loading: true, data: null, error: null });
    try { const data = await promise; setState({ loading: false, data, error: null }); return data; }
    catch (error) { setState({ loading: false, data: null, error: error as Error }); throw error; }
  }, []);
  return { ...state, execute };
}
