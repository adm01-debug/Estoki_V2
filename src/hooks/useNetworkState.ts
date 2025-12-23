import { useState, useEffect } from 'react';

interface NetworkState {
  online: boolean;
  type?: string;
  downlink?: number;
  rtt?: number;
}

export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    online: navigator.onLine,
  });

  useEffect(() => {
    const handleOnline = () => setState(s => ({ ...s, online: true }));
    const handleOffline = () => setState(s => ({ ...s, online: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      setState({
        online: navigator.onLine,
        type: conn?.type,
        downlink: conn?.downlink,
        rtt: conn?.rtt,
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return state;
}

export default useNetworkState;
