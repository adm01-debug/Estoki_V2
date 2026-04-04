import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "estoki-sidebar-favorites";
const MAX_FAVORITES = 6;

export function useSidebarFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = useCallback((path: string) => {
    setFavorites((prev) => {
      if (prev.includes(path)) {
        return prev.filter((p) => p !== path);
      }
      if (prev.length >= MAX_FAVORITES) return prev;
      return [...prev, path];
    });
  }, []);

  const isFavorite = useCallback(
    (path: string) => favorites.includes(path),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
