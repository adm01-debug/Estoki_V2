import { useCallback, useLayoutEffect, useRef } from 'react';

export function useScrollLock(initialLocked: boolean = false) {
  const isLocked = useRef(initialLocked);
  const originalStyle = useRef<string>('');

  const lock = useCallback(() => {
    if (isLocked.current) return;
    originalStyle.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    isLocked.current = true;
  }, []);

  const unlock = useCallback(() => {
    if (!isLocked.current) return;
    document.body.style.overflow = originalStyle.current;
    isLocked.current = false;
  }, []);

  useLayoutEffect(() => {
    if (initialLocked) lock();
    return () => unlock();
  }, [initialLocked, lock, unlock]);

  return { lock, unlock, isLocked: isLocked.current };
}
