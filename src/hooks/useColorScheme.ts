import { useState, useEffect } from 'react';
type ColorScheme = 'light' | 'dark' | 'no-preference';
export function useColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'no-preference';
  });
  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      if (darkQuery.matches) setScheme('dark');
      else if (lightQuery.matches) setScheme('light');
      else setScheme('no-preference');
    };
    darkQuery.addEventListener('change', handler);
    lightQuery.addEventListener('change', handler);
    return () => { darkQuery.removeEventListener('change', handler); lightQuery.removeEventListener('change', handler); };
  }, []);
  return scheme;
}
