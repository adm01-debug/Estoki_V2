import { useState, useEffect, useCallback, useRef } from 'react';
interface GeofenceZone { id: string; lat: number; lng: number; radius: number; }
export function useGeofencing(zones: GeofenceZone[]) {
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  const [isInside, setIsInside] = useState(false);
  const watchId = useRef<number>();
  useEffect(() => {
    watchId.current = navigator.geolocation.watchPosition(pos => {
      const { latitude, longitude } = pos.coords;
      for (const zone of zones) {
        const dist = Math.sqrt(Math.pow(latitude - zone.lat, 2) + Math.pow(longitude - zone.lng, 2)) * 111000;
        if (dist <= zone.radius) { setCurrentZone(zone.id); setIsInside(true); return; }
      }
      setCurrentZone(null); setIsInside(false);
    });
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, [zones]);
  return { currentZone, isInside };
}
