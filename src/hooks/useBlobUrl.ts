import { useState, useEffect, useCallback } from 'react';
export function useBlobUrl(blob: Blob | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { if (!blob) { setUrl(null); return; } const u = URL.createObjectURL(blob); setUrl(u); return () => URL.revokeObjectURL(u); }, [blob]);
  return url;
}
