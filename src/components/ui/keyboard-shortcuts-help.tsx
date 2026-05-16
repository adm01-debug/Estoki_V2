import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GLOBAL_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts';

interface ShortcutItem {
  keys: string[];
  description: string;
  category?: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ['⌘', 'K'], description: 'Abrir busca global', category: 'Navegação' },
  { keys: ['⌘', 'N'], description: 'Criar novo item', category: 'Ações' },
  { keys: ['⌘', 'S'], description: 'Salvar', category: 'Ações' },
  { keys: ['Esc'], description: 'Cancelar / Fechar', category: 'Ações' },
  { keys: ['⌘', '⇧', 'H'], description: 'Ir para Home', category: 'Navegação' },
  { keys: ['⌘', '⇧', 'I'], description: 'Ir para Inventário', category: 'Navegação' },
  { keys: ['⌘', '⇧', 'E'], description: 'Ir para Recebimento', category: 'Navegação' },
  { keys: ['⌘', '⇧', 'X'], description: 'Ir para Expedição', category: 'Navegação' },
  { keys: ['⌘', 'R'], description: 'Atualizar dados', category: 'Ações' },
  { keys: ['?'], description: 'Mostrar ajuda de atalhos', category: 'Ajuda' },
];

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded bg-muted border text-xs font-mono">
      {children}
    </kbd>
  );
}

 export function KeyboardShortcutsHelp({ open: controlledOpen, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
   const [internalOpen, setInternalOpen] = useState(false);
   const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
   const setOpen = onOpenChange || setInternalOpen;

  const groupedShortcuts = shortcuts.reduce((acc, item) => {
    const category = item.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">Atalhos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{category}</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <KeyboardKey>{key}</KeyboardKey>
                          {i < item.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Pressione <KeyboardKey>?</KeyboardKey> a qualquer momento para ver esta ajuda
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default KeyboardShortcutsHelp;
