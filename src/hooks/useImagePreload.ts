import { useEffect, useCallback } from 'react';
export function useImagePreload(urls: string[]) {
  const urlsKey = urls.join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { urls.forEach(url => { const img = new Image(); img.src = url; }); }, [urlsKey]);
}
