import { useCallback } from 'react';

interface ScrollOptions { behavior?: ScrollBehavior; block?: ScrollLogicalPosition; }

export function useScrollTo() {
  const scrollToTop = useCallback((options?: ScrollOptions) => {
    window.scrollTo({ top: 0, behavior: options?.behavior || 'smooth' });
  }, []);

  const scrollToBottom = useCallback((options?: ScrollOptions) => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: options?.behavior || 'smooth' });
  }, []);

  const scrollToElement = useCallback((element: HTMLElement | string, options?: ScrollOptions) => {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    el?.scrollIntoView({ behavior: options?.behavior || 'smooth', block: options?.block || 'start' });
  }, []);

  const scrollToPosition = useCallback((x: number, y: number, options?: ScrollOptions) => {
    window.scrollTo({ left: x, top: y, behavior: options?.behavior || 'smooth' });
  }, []);

  return { scrollToTop, scrollToBottom, scrollToElement, scrollToPosition };
}
