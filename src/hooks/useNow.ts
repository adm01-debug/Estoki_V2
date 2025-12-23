import { useState, useEffect } from 'react';
export function useNow(interval: number = 1000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), interval); return () => clearInterval(id); }, [interval]);
  return now;
}
