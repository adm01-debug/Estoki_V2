import { useState, useCallback, useRef } from 'react';

interface CacheItem<T> { value: T; expiry: number | null; }

export function useCache<T>(defaultTtl: number = 5 * 60 * 1000) {
  const cache = useRef<Map<string, CacheItem<T>>>(new Map());
  const [, forceUpdate] = useState({});

  const set = useCallback((key: string, value: T, ttl?: number) => {
    const expiry = ttl !== undefined ? Date.now() + ttl : (defaultTtl ? Date.now() + defaultTtl : null);
    cache.current.set(key, { value, expiry });
    forceUpdate({});
  }, [defaultTtl]);

  const get = useCallback((key: string): T | undefined => {
    const item = cache.current.get(key);
    if (!item) return undefined;
    if (item.expiry && Date.now() > item.expiry) {
      cache.current.delete(key);
      return undefined;
    }
    return item.value;
  }, []);

  const remove = useCallback((key: string) => {
    cache.current.delete(key);
    forceUpdate({});
  }, []);

  const clear = useCallback(() => {
    cache.current.clear();
    forceUpdate({});
  }, []);

  const has = useCallback((key: string): boolean => {
    return get(key) !== undefined;
  }, [get]);

  return { get, set, remove, clear, has, size: cache.current.size };
}
