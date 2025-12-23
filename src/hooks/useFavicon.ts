import { useEffect, useCallback } from 'react';
export function useFavicon(href: string) {
  const setFavicon = useCallback((newHref: string) => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = newHref;
  }, []);
  useEffect(() => { setFavicon(href); }, [href, setFavicon]);
  return setFavicon;
}
