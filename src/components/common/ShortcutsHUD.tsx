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
      if (
        e.key === "?" &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <Card className="overflow-hidden rounded-[32px] border-primary/20 shadow-2xl">
              <CardHeader className="border-b border-border/10 bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2">
                      <Keyboard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black uppercase tracking-tight">
                        Atalhos de Elite
                      </CardTitle>
                      <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
                        Aumente sua produtividade
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-1">
                    {shortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between rounded-2xl p-3 transition-colors hover:bg-muted/50"
                      >
                        <span className="text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                          {shortcut.description}
                        </span>
                        <div className="flex gap-1.5">
                          {shortcut.ctrl && (
                            <kbd className="flex h-6 min-w-[24px] items-center justify-center rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-black uppercase shadow-sm">
                              Ctrl
                            </kbd>
                          )}
                          {shortcut.shift && (
                            <kbd className="flex h-6 min-w-[24px] items-center justify-center rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-black uppercase shadow-sm">
                              Shift
                            </kbd>
                          )}
                          {shortcut.alt && (
                            <kbd className="flex h-6 min-w-[24px] items-center justify-center rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-black uppercase shadow-sm">
                              Alt
                            </kbd>
                          )}
                          <kbd className="flex h-6 min-w-[24px] items-center justify-center rounded border border-primary/20 bg-primary/5 px-1.5 font-mono text-[11px] font-black uppercase text-primary shadow-sm">
                            {shortcut.key}
                          </kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center border-t border-border/10 bg-muted/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
