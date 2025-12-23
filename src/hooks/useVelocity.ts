import { useRef, useEffect, useState } from 'react';
export function useVelocity(value: number) {
  const [velocity, setVelocity] = useState(0);
  const prevValue = useRef(value);
  const prevTime = useRef(Date.now());
  useEffect(() => {
    const now = Date.now();
    const dt = now - prevTime.current;
    if (dt > 0) setVelocity((value - prevValue.current) / dt * 1000);
    prevValue.current = value;
    prevTime.current = now;
  }, [value]);
  return velocity;
}
