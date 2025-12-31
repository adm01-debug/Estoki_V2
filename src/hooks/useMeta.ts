import { useEffect, useCallback } from 'react';
export function useMeta(name: string, content: string) {
  const setMeta = useCallback((newContent: string) => {
    let meta: HTMLMetaElement | null = document.querySelector(`meta[name="${name}"]`);
    if (!meta) { meta = document.createElement('meta'); meta.name = name; document.head.appendChild(meta); }
    meta.content = newContent;
  }, [name]);
  useEffect(() => { setMeta(content); }, [content, setMeta]);
  return setMeta;
}
