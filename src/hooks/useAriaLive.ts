import { useCallback, useRef } from 'react';
export function useAriaLive() {
  const liveRef = useRef<HTMLDivElement | null>(null);
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => { if (!liveRef.current) { const el = document.createElement('div'); el.setAttribute('aria-live', priority); el.setAttribute('aria-atomic', 'true'); el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)'; document.body.appendChild(el); liveRef.current = el; } liveRef.current.setAttribute('aria-live', priority); liveRef.current.textContent = ''; setTimeout(() => { if (liveRef.current) liveRef.current.textContent = message; }, 100); }, []);
  return { announce };
}
