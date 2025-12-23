import { useState, useEffect } from 'react';
export function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return { hours: time.getHours(), minutes: time.getMinutes(), seconds: time.getSeconds(), time };
}
