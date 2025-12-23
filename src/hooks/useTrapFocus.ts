import { useEffect, useRef, useCallback } from 'react';
export function useTrapFocus(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const focusable = containerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handler);
    first?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [isActive]);
  return containerRef;
}
