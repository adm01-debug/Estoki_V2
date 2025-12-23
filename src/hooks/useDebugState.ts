import { useDebugValue } from 'react';
export function useDebugState<T>(value: T, formatter?: (value: T) => string) {
  useDebugValue(value, formatter);
  return value;
}
