import { useState, useEffect, useCallback } from 'react';
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);
  const toggle = useCallback(() => setIsDark(d => !d), []);
  const enable = useCallback(() => setIsDark(true), []);
  const disable = useCallback(() => setIsDark(false), []);
  return { isDark, toggle, enable, disable };
}
