import { useState, useCallback } from 'react';
export function useErrorBoundaryState() {
  const [error, setError] = useState<Error | null>(null);
  const resetError = useCallback(() => setError(null), []);
  const captureError = useCallback((err: Error) => setError(err), []);
  return { error, resetError, captureError, hasError: !!error };
}
