import { useState, useCallback, useRef, useEffect } from 'react';
export function useSpring(target: number, config = { stiffness: 170, damping: 26 }) {
  const [value, setValue] = useState(target);
  const velocity = useRef(0);
  const raf = useRef<number>();
  useEffect(() => {
    const animate = () => {
      const force = config.stiffness * (target - value);
      const damping = config.damping * velocity.current;
      velocity.current += (force - damping) / 100;
      setValue(v => v + velocity.current);
      if (Math.abs(target - value) > 0.01 || Math.abs(velocity.current) > 0.01) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, config.stiffness, config.damping]);
  return value;
}
