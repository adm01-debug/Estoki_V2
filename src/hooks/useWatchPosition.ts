import { useState, useEffect, useCallback } from 'react';
export function useWatchPosition() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const start = useCallback(() => {
    const id = navigator.geolocation.watchPosition(setPosition, setError, { enableHighAccuracy: true });
    setWatchId(id);
  }, []);
  const stop = useCallback(() => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); setWatchId(null); }, [watchId]);
  useEffect(() => () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); }, [watchId]);
  return { position, error, start, stop, isWatching: watchId !== null };
}
