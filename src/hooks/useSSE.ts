import { useState, useEffect, useRef, useCallback } from 'react';
export function useSSE(url: string) {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    esRef.current = new EventSource(url);
    esRef.current.onmessage = (e) => setData(e.data);
    esRef.current.onerror = () => setError(new Error('SSE Error'));
    return () => esRef.current?.close();
  }, [url]);
  const close = useCallback(() => esRef.current?.close(), []);
  return { data, error, close };
}
