import { useState, useEffect, useCallback, useRef } from 'react';
export function useTimer(initialTime: number = 0) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (isRunning) { intervalRef.current = setInterval(() => setTime(t => t + 1), 1000); }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);
  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => { setTime(initialTime); setIsRunning(false); }, [initialTime]);
  return { time, isRunning, start, stop, reset };
}
