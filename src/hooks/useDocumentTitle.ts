import { useEffect } from "react";

/**
 * Define o título da aba do navegador e restaura o anterior ao desmontar.
 * Título indefinido = layout aninhado: mantém o título do layout pai.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return;
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
