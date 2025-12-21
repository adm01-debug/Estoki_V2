import { useCallback, useRef, useEffect } from "react";

/**
 * Hook para throttle de funções
 * Limita a execução a no máximo uma vez por intervalo
 * Útil para scroll handlers e resize events
 * 
 * @example
 * const throttledScroll = useThrottle(handleScroll, 100);
 * window.addEventListener("scroll", throttledScroll);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        // Agenda para executar no final do intervalo
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastRunRef.current));
      }
    },
    [callback, delay]
  ) as T;

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook para throttle de valores
 */
import { useState } from "react";

export function useThrottledValue<T>(value: T, delay: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();

    if (now - lastUpdateRef.current >= delay) {
      lastUpdateRef.current = now;
      setThrottledValue(value);
    } else {
      const timeoutId = setTimeout(() => {
        lastUpdateRef.current = Date.now();
        setThrottledValue(value);
      }, delay - (now - lastUpdateRef.current));

      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);

  return throttledValue;
}
