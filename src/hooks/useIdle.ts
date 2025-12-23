import { useState, useEffect, useCallback } from 'react';

export function useIdle(timeout = 60000) {
  const [isIdle, setIsIdle] = useState(false);

  const handleActivity = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timeoutId: number;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      handleActivity();
      timeoutId = window.setTimeout(() => setIsIdle(true), timeout);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, handleActivity]);

  return isIdle;
}

export default useIdle;
