import { useState, useEffect } from 'react';

export function useTimeAgo(date: Date | string | number) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculate = () => {
      const now = Date.now();
      const then = new Date(date).getTime();
      const diff = now - then;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d atrás`;
      if (hours > 0) return `${hours}h atrás`;
      if (minutes > 0) return `${minutes}min atrás`;
      return 'agora';
    };

    setTimeAgo(calculate());
    const interval = setInterval(() => setTimeAgo(calculate()), 60000);
    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
}

export default useTimeAgo;
