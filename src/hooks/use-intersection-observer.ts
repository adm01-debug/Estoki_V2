import { useState, useEffect, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;
  const ref = useRef<T>(null);
  const [isIntersecting, setIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (frozen.current && freezeOnceVisible)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && freezeOnceVisible) frozen.current = true;
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [ref, isIntersecting, entry];
}

export function useLazyLoad<T extends Element>(): [RefObject<T>, boolean] {
  const [ref, isVisible] = useIntersectionObserver<T>({ freezeOnceVisible: true, rootMargin: '100px' });
  return [ref, isVisible];
}

export default useIntersectionObserver;
