import { useState, useEffect, useCallback } from "react";

interface QueryOptions { enabled?: boolean; refetchInterval?: number; }

export function useQuery<T>(queryKey: string, queryFn: () => Promise<T>, options: QueryOptions = {}) {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await queryFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Query failed"));
    } finally {
      setIsLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    if (enabled) fetch();
  }, [enabled, queryKey]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const id = setInterval(fetch, refetchInterval);
      return () => clearInterval(id);
    }
  }, [refetchInterval, enabled, fetch]);

  return { data, error, isLoading, refetch: fetch };
}
