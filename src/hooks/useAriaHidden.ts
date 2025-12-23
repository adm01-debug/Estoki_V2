import { useEffect } from 'react';
export function useAriaHidden(isOpen: boolean, rootId = 'root') {
  useEffect(() => {
    if (!isOpen) return;
    const root = document.getElementById(rootId);
    if (root) { root.setAttribute('aria-hidden', 'true'); root.setAttribute('inert', ''); }
    return () => { if (root) { root.removeAttribute('aria-hidden'); root.removeAttribute('inert'); } };
  }, [isOpen, rootId]);
}
