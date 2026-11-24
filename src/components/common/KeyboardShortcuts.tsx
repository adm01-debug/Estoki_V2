import React, { useState } from "react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/ui/keyboard-shortcuts-help";

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useKeyboardShortcut(
    "?",
    () => {
      setShowHelp(true);
    },
    ["shift"]
  );

  // Sem gatilho visual: o painel é uma ajuda para quem usa teclado e abre pelo
  // atalho "?" (o gatilho no AppProviders era o 1º elemento focável da página,
  // antes dos skip-links, e ficava escondido atrás da sidebar no desktop).
  return <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} withTrigger={false} />;
}
