import { useState, useEffect, useCallback } from 'react';
export function useImage(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const img = new Image(); img.src = src;
    img.onload = () => { setLoaded(true); setDimensions({ width: img.width, height: img.height }); };
    img.onerror = () => setError(new Error('Image load error'));
  }, [src]);
  return { loaded, error, dimensions };
}
