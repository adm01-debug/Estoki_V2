import { useEffect, useCallback } from 'react';
export function useImagePreload(urls: string[]) {
  useEffect(() => { urls.forEach(url => { const img = new Image(); img.src = url; }); }, [urls.join(',')]);
}
