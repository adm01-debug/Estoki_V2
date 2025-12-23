import { useState, useEffect, useRef, RefObject } from 'react';
interface Options { threshold?: number | number[]; root?: Element | null; rootMargin?: string; }
export function useIntersectionObserver<T extends HTMLElement>(options?: Options): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([e]) => { setIsIntersecting(e.isIntersecting); setEntry(e); }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options?.threshold, options?.root, options?.rootMargin]);
  return [ref, isIntersecting, entry];
}
