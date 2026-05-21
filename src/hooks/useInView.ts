import { useState, useRef, useEffect, RefObject } from 'react';
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
    observer.observe(ref.current);
    return () => observer.disconnect();
    // observa novamente apenas quando as opções escalares mudam (options é objeto novo a cada render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.threshold, options?.root, options?.rootMargin]);
  return [ref, inView];
}
