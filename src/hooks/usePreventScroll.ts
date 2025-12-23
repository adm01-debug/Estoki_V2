import { useEffect, useRef } from 'react';
export function usePreventScroll(prevent: boolean) {
  const scrollPos = useRef(0);
  useEffect(() => {
    if (!prevent) return;
    scrollPos.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPos.current}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPos.current);
    };
  }, [prevent]);
}
