import { useState, useCallback, useRef } from 'react';
export function useAriaLive() {
  const [message, setMessage] = useState('');
  const regionRef = useRef<HTMLDivElement>(null);
  const announce = useCallback((text: string, priority: 'polite' | 'assertive' = 'polite') => {
    setMessage('');
    setTimeout(() => setMessage(text), 100);
  }, []);
  const clear = useCallback(() => setMessage(''), []);
  const AriaLiveRegion = () => <div ref={regionRef} aria-live="polite" aria-atomic="true" className="sr-only">{message}</div>;
  return { announce, clear, message, AriaLiveRegion };
}
