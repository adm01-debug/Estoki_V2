import { useState, useCallback, useEffect } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(asyncFn: () => Promise<T>, immediate = true) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: immediate, error: null });

  const execute = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState(s => ({ ...s, loading: false, error: error as Error }));
      throw error;
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) execute();
  }, [immediate]);

  return { ...state, execute, refetch: execute };
}
