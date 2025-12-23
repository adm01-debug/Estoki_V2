import { useState, useEffect, useCallback } from 'react';

export function useStopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => { setTime(0); setIsRunning(false); }, []);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return { time, minutes, seconds, isRunning, start, pause, reset };
}

export default useStopwatch;
