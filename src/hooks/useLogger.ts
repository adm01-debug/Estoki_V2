import { useCallback } from 'react';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export function useLogger(prefix: string = 'App') {
  const log = useCallback((level: LogLevel, message: string, data?: unknown) => {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${prefix}] ${message}`, data || '');
  }, [prefix]);
  const debug = useCallback((msg: string, data?: unknown) => log('debug', msg, data), [log]);
  const info = useCallback((msg: string, data?: unknown) => log('info', msg, data), [log]);
  const warn = useCallback((msg: string, data?: unknown) => log('warn', msg, data), [log]);
  const error = useCallback((msg: string, data?: unknown) => log('error', msg, data), [log]);
  return { debug, info, warn, error };
}
