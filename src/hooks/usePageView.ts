import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export function usePageView() {
  const location = useLocation();
  useEffect(() => {
    console.log('[PageView]', location.pathname);
    if (typeof window !== 'undefined' && (window as any).gtag) { (window as any).gtag('config', 'GA_MEASUREMENT_ID', { page_path: location.pathname }); }
  }, [location]);
}
