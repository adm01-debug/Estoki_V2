import { useCallback } from 'react';
export function useHead() {
  const setTitle = useCallback((title: string) => { document.title = title; }, []);
  const setMeta = useCallback((name: string, content: string) => {
    let meta = document.querySelector(\`meta[name="\${name}"]\`) as HTMLMetaElement;
    if (!meta) { meta = document.createElement('meta'); meta.name = name; document.head.appendChild(meta); }
    meta.content = content;
  }, []);
  const setLink = useCallback((rel: string, href: string) => {
    let link = document.querySelector(\`link[rel="\${rel}"]\`) as HTMLLinkElement;
    if (!link) { link = document.createElement('link'); link.rel = rel; document.head.appendChild(link); }
    link.href = href;
  }, []);
  return { setTitle, setMeta, setLink };
}
