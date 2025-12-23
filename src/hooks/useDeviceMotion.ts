import { useState, useEffect } from 'react';
interface MotionData { acceleration: { x: number | null; y: number | null; z: number | null }; rotationRate: { alpha: number | null; beta: number | null; gamma: number | null }; }
export function useDeviceMotion() {
  const [motion, setMotion] = useState<MotionData | null>(null);
  useEffect(() => {
    const handler = (e: DeviceMotionEvent) => {
      setMotion({ acceleration: { x: e.acceleration?.x ?? null, y: e.acceleration?.y ?? null, z: e.acceleration?.z ?? null }, 
        rotationRate: { alpha: e.rotationRate?.alpha ?? null, beta: e.rotationRate?.beta ?? null, gamma: e.rotationRate?.gamma ?? null } });
    };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, []);
  return motion;
}
