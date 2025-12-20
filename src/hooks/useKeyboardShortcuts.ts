import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    // Navigation
    { key: "h", ctrl: true, action: () => navigate("/"), description: "Ir para Início" },
    { key: "d", ctrl: true, action: () => navigate("/dashboard"), description: "Ir para Dashboard" },
    { key: "r", ctrl: true, action: () => navigate("/recebimento"), description: "Ir para Recebimento" },
    { key: "t", ctrl: true, action: () => navigate("/triagem"), description: "Ir para Triagem" },
    { key: "e", ctrl: true, action: () => navigate("/estoque"), description: "Ir para Estoque" },
    { key: "s", ctrl: true, shift: true, action: () => navigate("/scanner"), description: "Abrir Scanner" },
    
    // Actions
    { key: "k", ctrl: true, action: () => toast.info("Atalhos disponíveis: Ctrl+H (Início), Ctrl+D (Dashboard), Ctrl+R (Recebimento), Ctrl+T (Triagem), Ctrl+E (Estoque)"), description: "Mostrar atalhos" },
    { key: "?", action: () => toast.info("Pressione Ctrl+K para ver todos os atalhos de teclado"), description: "Ajuda" },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        altMatch &&
        shiftMatch
      ) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}
