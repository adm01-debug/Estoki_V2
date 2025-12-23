import { useState, useCallback, useRef, useEffect } from 'react';
export function useRoving<T extends HTMLElement>(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsRef = useRef<(T | null)[]>([]);
  const setItemRef = useCallback((index: number) => (el: T | null) => { itemsRef.current[index] = el; }, []);
  const onKeyDown = useCallback((e: React.KeyboardEvent) => { let newIndex = activeIndex; if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); newIndex = (activeIndex + 1) % itemCount; } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); newIndex = (activeIndex - 1 + itemCount) % itemCount; } else if (e.key === 'Home') { e.preventDefault(); newIndex = 0; } else if (e.key === 'End') { e.preventDefault(); newIndex = itemCount - 1; } setActiveIndex(newIndex); itemsRef.current[newIndex]?.focus(); }, [activeIndex, itemCount]);
  const getItemProps = useCallback((index: number) => ({ tabIndex: index === activeIndex ? 0 : -1, ref: setItemRef(index), onKeyDown }), [activeIndex, setItemRef, onKeyDown]);
  return { activeIndex, setActiveIndex, getItemProps };
}
