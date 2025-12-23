import { useState, useEffect } from 'react';
interface OrientationData { alpha: number | null; beta: number | null; gamma: number | null; }
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<OrientationData | null>(null);
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => { setOrientation({ alpha: e.alpha, beta: e.beta, gamma: e.gamma }); };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);
  return orientation;
}
