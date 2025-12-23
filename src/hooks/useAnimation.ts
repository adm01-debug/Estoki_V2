import { useRef, useCallback, useState } from 'react';
export function useAnimation(duration: number = 1000) {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();
  const start = useCallback(() => {
    setIsAnimating(true);
    startRef.current = performance.now();
    const animate = (time: number) => {
      const elapsed = time - (startRef.current || 0);
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
      else setIsAnimating(false);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [duration]);
  const stop = useCallback(() => { if (rafRef.current) cancelAnimationFrame(rafRef.current); setIsAnimating(false); }, []);
  return { progress, isAnimating, start, stop };
}
