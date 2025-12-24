import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollState {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  isScrolling: boolean;
  progress: number;
}

interface UseScrollOptions {
  target?: React.RefObject<HTMLElement>;
  throttle?: number;
}

export function useScroll(options: UseScrollOptions = {}) {
  const { target, throttle = 100 } = options;
  const [state, setState] = useState<ScrollState>({
    x: 0,
    y: 0,
    direction: null,
    isScrolling: false,
    progress: 0,
  });
  
  const lastY = useRef(0);
  const lastX = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const lastUpdate = useRef(0);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current < throttle) return;
    lastUpdate.current = now;

    const element = target?.current || document.documentElement;
    const scrollY = target?.current ? element.scrollTop : window.scrollY;
    const scrollX = target?.current ? element.scrollLeft : window.scrollX;
    
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;

    let direction: ScrollState['direction'] = null;
    if (scrollY > lastY.current) direction = 'down';
    else if (scrollY < lastY.current) direction = 'up';
    else if (scrollX > lastX.current) direction = 'right';
    else if (scrollX < lastX.current) direction = 'left';

    lastY.current = scrollY;
    lastX.current = scrollX;

    setState({
      x: scrollX,
      y: scrollY,
      direction,
      isScrolling: true,
      progress,
    });

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isScrolling: false }));
    }, 150);
  }, [target, throttle]);

  const scrollTo = useCallback((options: ScrollToOptions) => {
    const element = target?.current || window;
    element.scrollTo(options);
  }, [target]);

  const scrollToTop = useCallback(() => scrollTo({ top: 0, behavior: 'smooth' }), [scrollTo]);
  const scrollToBottom = useCallback(() => {
    const element = target?.current || document.documentElement;
    scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
  }, [scrollTo, target]);

  useEffect(() => {
    const element = target?.current || window;
    element.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => element.removeEventListener('scroll', handleScroll);
  }, [handleScroll, target]);

  return { ...state, scrollTo, scrollToTop, scrollToBottom };
}
