import { useState, useRef, useLayoutEffect, RefObject } from 'react';
interface Size { width: number; height: number; }
export function useResizeObserver<T extends HTMLElement>(): [RefObject<T>, Size] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height }); });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, size];
}
