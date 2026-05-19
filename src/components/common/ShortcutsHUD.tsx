import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Keyboard, X } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ShortcutsHUD = memo(function ShortcutsHUD() {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Alt + / or just listen for the '?' key if not in an input
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] p-4"
          >
            <Card className="shadow-2xl border-primary/20 overflow-hidden rounded-[32px]">
              <CardHeader className="border-b border-border/10 bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Keyboard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Atalhos de Elite</CardTitle>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Aumente sua produtividade</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                  <div className="grid grid-cols-1 gap-1">
                    {shortcuts.map((shortcut, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors group"
                      >
                        <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                          {shortcut.description}
                        </span>
                        <div className="flex gap-1.5">
                          {shortcut.ctrl && (
                            <kbd className="h-6 min-w-[24px] px-1.5 rounded border border-border/50 bg-muted flex items-center justify-center text-[10px] font-mono font-black shadow-sm uppercase">
                              Ctrl
                            </kbd>
                          )}
                          {shortcut.shift && (
                            <kbd className="h-6 min-w-[24px] px-1.5 rounded border border-border/50 bg-muted flex items-center justify-center text-[10px] font-mono font-black shadow-sm uppercase">
                              Shift
                            </kbd>
                          )}
                          {shortcut.alt && (
                            <kbd className="h-6 min-w-[24px] px-1.5 rounded border border-border/50 bg-muted flex items-center justify-center text-[10px] font-mono font-black shadow-sm uppercase">
                              Alt
                            </kbd>
                          )}
                          <kbd className="h-6 min-w-[24px] px-1.5 rounded border border-primary/20 bg-primary/5 flex items-center justify-center text-[11px] font-mono font-black text-primary shadow-sm uppercase">
                            {shortcut.key}
                          </kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-muted/20 border-t border-border/10 flex items-center justify-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    PROMO BRINDES INTELLIGENCE • OPERAÇÃO DE EXCELÊNCIA
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
