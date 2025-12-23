import { useEffect } from 'react';
export function useDevtools<T>(name: string, value: T) {
  useEffect(() => { if (process.env.NODE_ENV === 'development') { (window as any).__DEVTOOLS__ = (window as any).__DEVTOOLS__ || {}; (window as any).__DEVTOOLS__[name] = value; } }, [name, value]);
}
