import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const shortcut = shortcuts.find(s => {
        const keys = s.key.toLowerCase().split("+");
        const ctrl = keys.includes("ctrl") === e.ctrlKey;
        const shift = keys.includes("shift") === e.shiftKey;
        const key = keys.filter(k => !["ctrl", "shift"].includes(k))[0];
        return ctrl && shift && e.key.toLowerCase() === key;
      });
      
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    }
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const shortcuts = [
    { keys: "Ctrl+K", description: "Busca rápida" },
    { keys: "Ctrl+N", description: "Novo registro" },
    { keys: "Esc", description: "Fechar modal" },
    { keys: "?", description: "Mostrar atalhos" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div key={s.keys} className="flex justify-between">
              <span>{s.description}</span>
              <kbd className="px-2 py-1 bg-muted rounded text-sm">{s.keys}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
