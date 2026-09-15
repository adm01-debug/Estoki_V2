import { useEffect } from "react";
export function useDevtools<T>(name: string, value: T) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).__DEVTOOLS__ = (window as any).__DEVTOOLS__ || {};
      (window as any).__DEVTOOLS__[name] = value;
    }
  }, [name, value]);
}
