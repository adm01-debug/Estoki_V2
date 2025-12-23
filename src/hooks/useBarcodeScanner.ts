import { useState, useEffect, useCallback } from 'react';

export function useBarcodeScanner(onScan: (code: string) => void) {
  const [buffer, setBuffer] = useState('');
  const [lastKeyTime, setLastKeyTime] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyTime > 50) setBuffer('');
      setLastKeyTime(now);
      
      if (e.key === 'Enter' && buffer.length > 3) {
        onScan(buffer);
        setBuffer('');
      } else if (e.key.length === 1) {
        setBuffer(prev => prev + e.key);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [buffer, lastKeyTime, onScan]);

  const reset = useCallback(() => setBuffer(''), []);

  return { buffer, reset };
}

export default useBarcodeScanner;
