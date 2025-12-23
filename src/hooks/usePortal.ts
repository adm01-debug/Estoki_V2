import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
export function usePortal(id = 'portal-root') {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('div'); el.id = id; document.body.appendChild(el); }
    setContainer(el);
  }, [id]);
  const Portal = useCallback(({ children }: { children: React.ReactNode }) => container ? createPortal(children, container) : null, [container]);
  return { Portal, container };
}
