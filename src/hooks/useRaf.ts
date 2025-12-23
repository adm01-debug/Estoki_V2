import { useRef, useCallback, useEffect } from 'react';
export function useRaf(callback: (deltaTime: number) => void, isRunning = true) {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const loop = useCallback((time: number) => { const delta = time - lastTimeRef.current; lastTimeRef.current = time; callback(delta); frameRef.current = requestAnimationFrame(loop); }, [callback]);
  useEffect(() => { if (isRunning) { lastTimeRef.current = performance.now(); frameRef.current = requestAnimationFrame(loop); } return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }; }, [isRunning, loop]);
}
