import { useEffect, useCallback, useState } from 'react';
export function useScript(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const script = document.createElement('script'); script.src = src; script.async = true;
    script.onload = () => setLoaded(true); script.onerror = () => setError(new Error('Script load error'));
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [src]);
  return { loaded, error };
}
