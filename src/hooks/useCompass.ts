import { useState, useEffect } from 'react';
export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => { if (e.alpha !== null) setHeading(e.alpha); };
    if ('DeviceOrientationEvent' in window) { window.addEventListener('deviceorientation', handler); }
    else { setError('DeviceOrientation not supported'); }
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);
  return { heading, error, direction: heading ? ['N','NE','E','SE','S','SW','W','NW'][Math.round(heading / 45) % 8] : null };
}
