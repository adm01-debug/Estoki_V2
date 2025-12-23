import React from 'react';
import { useId } from 'react';
interface FocusScopeProps { children: React.ReactNode; contain?: boolean; restoreFocus?: boolean; autoFocus?: boolean; }
export function FocusScope({ children, contain = true, restoreFocus = true, autoFocus = true }: FocusScopeProps) {
  const id = useId();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (autoFocus && scopeRef.current) {
      const focusable = scopeRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      focusable?.focus();
    }
  }, [autoFocus]);
  return <div ref={scopeRef} data-focus-scope={id}>{children}</div>;
}
