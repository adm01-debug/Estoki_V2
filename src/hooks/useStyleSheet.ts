import { useEffect, useState } from 'react';
export function useStyleSheet(href: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href;
    link.onload = () => setLoaded(true);
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [href]);
  return loaded;
}
