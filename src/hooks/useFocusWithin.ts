import { useState, useCallback, useRef } from 'react';
export function useFocusWithin() {
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onFocus = useCallback(() => setIsFocusWithin(true), []);
  const onBlur = useCallback((e: React.FocusEvent) => { if (ref.current && !ref.current.contains(e.relatedTarget as Node)) setIsFocusWithin(false); }, []);
  return { ref, isFocusWithin, handlers: { onFocus, onBlur } };
}
