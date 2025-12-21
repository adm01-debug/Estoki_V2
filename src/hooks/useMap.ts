import { useState, useCallback } from "react";

export function useMap<K, V>(initial: Map<K, V> = new Map()) {
  const [map, setMap] = useState<Map<K, V>>(initial);

  const set = useCallback((key: K, value: V) => setMap(m => new Map(m).set(key, value)), []);
  const remove = useCallback((key: K) => setMap(m => { const n = new Map(m); n.delete(key); return n; }), []);
  const clear = useCallback(() => setMap(new Map()), []);
  const reset = useCallback(() => setMap(initial), [initial]);
  const get = useCallback((key: K) => map.get(key), [map]);
  const has = useCallback((key: K) => map.has(key), [map]);

  return { map, set, remove, clear, reset, get, has, size: map.size };
}
