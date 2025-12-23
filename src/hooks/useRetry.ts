import { useState, useCallback, useRef } from 'react';
export function useRetry<T>(asyncFn: () => Promise<T>, maxRetries = 3, delay = 1000) {
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const execute = useCallback(async () => {
    for (let i = 0; i <= maxRetries; i++) {
      try { setAttempts(i); const result = await asyncFn(); setError(null); return result; }
      catch (e) { setError(e as Error); if (i < maxRetries) { setIsRetrying(true); await new Promise(r => setTimeout(r, delay * Math.pow(2, i))); setIsRetrying(false); } }
    }
    throw error;
  }, [asyncFn, maxRetries, delay]);
  return { execute, attempts, error, isRetrying };
}
