import { useState, useRef, useLayoutEffect } from 'react';
interface Rect { x: number; y: number; width: number; height: number; top: number; right: number; bottom: number; left: number; }
export function useMeasure<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) { const r = entry.contentRect; setRect({ x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, right: r.right, bottom: r.bottom, left: r.left }); }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, rect };
}
