import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => { setSeconds(initialSeconds); setIsRunning(false); }, [initialSeconds]);

  return { seconds, isRunning, start, pause, reset, isFinished: seconds <= 0 };
}

export default useCountdown;
