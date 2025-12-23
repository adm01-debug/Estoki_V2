import { useState, useEffect, useCallback } from 'react';
export function useObjectUrl(object: File | Blob | MediaSource | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { if (!object) { setUrl(null); return; } const u = URL.createObjectURL(object); setUrl(u); return () => URL.revokeObjectURL(u); }, [object]);
  return url;
}
