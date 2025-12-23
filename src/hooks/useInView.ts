import { useState, useRef, useEffect, RefObject } from 'react';
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options?.threshold, options?.root, options?.rootMargin]);
  return [ref, inView];
}
