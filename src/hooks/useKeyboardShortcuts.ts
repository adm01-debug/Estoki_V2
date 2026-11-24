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
    {
      key: "h",
      ctrl: true,
      action: () => {
        navigate("/");
        toast.info("Navegando para Início");
      },
      description: "Ir para Início",
    },
    {
      key: "d",
      ctrl: true,
      action: () => {
        navigate("/dashboard");
        toast.info("Dashboard Analítico");
      },
      description: "Ir para Dashboard",
    },
    {
      key: "r",
      ctrl: true,
      action: () => {
        navigate("/recebimento");
        toast.info("Novo Recebimento");
      },
      description: "Ir para Recebimento",
    },
    {
      key: "t",
      ctrl: true,
      action: () => {
        navigate("/triagem");
        toast.info("Triagem de Produtos");
      },
      description: "Ir para Triagem",
    },
    {
      key: "e",
      ctrl: true,
      action: () => {
        navigate("/estoque");
        toast.info("Estoque Central");
      },
      description: "Ir para Estoque",
    },
    {
      key: "l",
      ctrl: true,
      action: () => {
        navigate("/admin/auditoria");
        toast.info("Logs de Auditoria");
      },
      description: "Auditoria",
    },
    {
      key: "s",
      ctrl: true,
      shift: true,
      action: () => {
        navigate("/scanner");
        toast.info("Modo Scanner Ativado");
      },
      description: "Abrir Scanner",
    },

    // Actions
    {
      key: "f",
      ctrl: true,
      action: () => {
        window.dispatchEvent(new CustomEvent("open-global-search"));
      },
      description: "Busca Rápida",
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Atalho de letra unica nao pode roubar a digitacao em campos de formulario
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        Boolean(target.closest('[role="textbox"], [role="combobox"], [contenteditable="true"]'));
      if (isTyping) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !(event.ctrlKey || event.metaKey);
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
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}
