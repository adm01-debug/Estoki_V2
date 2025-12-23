import { useCallback, useRef } from 'react';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export function useDebugLog(prefix: string) {
  const logs = useRef<{ level: LogLevel; message: string; timestamp: Date }[]>([]);
  const log = useCallback((level: LogLevel, message: string) => { const entry = { level, message, timestamp: new Date() }; logs.current.push(entry); if (process.env.NODE_ENV === 'development') console[level](`[${prefix}]`, message); }, [prefix]);
  const debug = useCallback((msg: string) => log('debug', msg), [log]);
  const info = useCallback((msg: string) => log('info', msg), [log]);
  const warn = useCallback((msg: string) => log('warn', msg), [log]);
  const error = useCallback((msg: string) => log('error', msg), [log]);
  return { debug, info, warn, error, logs: logs.current };
}
