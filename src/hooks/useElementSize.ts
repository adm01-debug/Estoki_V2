import { useState, useCallback, useRef, useLayoutEffect } from 'react';

interface Size { width: number; height: number; }

export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    if (ref.current) {
      setSize({ width: ref.current.offsetWidth, height: ref.current.offsetHeight });
    }
  }, []);

  useLayoutEffect(() => {
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [handleResize]);

  return { ref, ...size };
}
