import { useState, useCallback, useEffect, RefObject } from 'react';

interface Position { x: number; y: number; }

export function useContextMenu<T extends HTMLElement>(ref: RefObject<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', close);
    return () => {
      element.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', close);
    };
  }, [ref, handleContextMenu, close]);

  return { isOpen, position, close };
}
