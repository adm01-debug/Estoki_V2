import { useState, useEffect } from 'react';
export function usePreferredLanguage(): string {
  const [language, setLanguage] = useState(() => navigator.language || 'en');
  useEffect(() => {
    const handler = () => setLanguage(navigator.language || 'en');
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);
  return language;
}
