import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, ArrowLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavItems, fabActions } from "./sidebar";

interface MobileNavigationProps {
  fabOpen: boolean;
  setFabOpen: (open: boolean) => void;
  pathname: string;
  onNavigate: (path: string) => void;
  onBack?: () => void;
}

export const MobileNavigation = memo(function MobileNavigation({
  fabOpen,
  setFabOpen,
  pathname,
  onNavigate,
  onBack,
}: MobileNavigationProps) {
  return (
    <>
      {/* FAB Overlay */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Quick Actions */}
      <AnimatePresence>
        {fabOpen && (
          <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:hidden">
            <motion.div
              className="flex gap-3 rounded-2xl border border-border/50 bg-card/95 p-3 shadow-2xl backdrop-blur-xl"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {fabActions.map((action, i) => (
                <motion.button
                  key={action.path}
                  onClick={() => {
                    setFabOpen(false);
                    onNavigate(action.path);
                  }}
                  className="flex w-16 flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-primary/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2 md:hidden"
        aria-label="Navegação mobile"
      >
        <div className="absolute inset-x-0 bottom-0 top-0 border-t border-border/10 bg-background/80 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl" />
        <div className="relative mx-auto flex h-14 max-w-md items-center justify-around px-1">
          {/* Mobile Navigation Controls - Smart & Contextual */}
          {pathname === "/" || pathname === "/dashboard" ? (
            <motion.button
              onClick={() => onNavigate("/hub")}
              whileTap={{ scale: 0.85 }}
              className="flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary"
              aria-label="Hub"
            >
              <Box className="h-5 w-5 opacity-70" />
              <span className="text-[10px] font-bold">Hub</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => onBack?.()}
              whileTap={{ scale: 0.85 }}
              className="flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-[10px] font-bold">Voltar</span>
            </motion.button>
          )}

          {mobileNavItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.path;
            return (
              <motion.button
                key={item.path}
                data-tour={item.tour}
                onClick={() => onNavigate(item.path)}
                whileTap={{ scale: 0.9 }}
                aria-label={`Ir para ${item.label}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200",
                  isActive ? "bg-primary/5 text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -top-1 h-1 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  )}
                />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}

          {/* FAB Center */}
          <div className="relative -mt-5">
            <motion.button
              onClick={() => setFabOpen(!fabOpen)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow transition-all duration-300",
                fabOpen
                  ? "rotate-45 bg-destructive"
                  : "bg-gradient-to-br from-primary to-primary/80"
              )}
              aria-label={fabOpen ? "Fechar ações rápidas" : "Ações rápidas"}
            >
              <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                {fabOpen ? (
                  <X className="h-6 w-6 text-destructive-foreground" />
                ) : (
                  <Box className="h-6 w-6 text-primary-foreground" />
                )}
              </motion.div>
            </motion.button>
          </div>

          {mobileNavItems.slice(2, 3).map((item) => {
            const isActive = pathname === item.path;
            return (
              <motion.button
                key={item.path}
                data-tour={item.tour}
                onClick={() => onNavigate(item.path)}
                whileTap={{ scale: 0.9 }}
                aria-label={`Ir para ${item.label}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200",
                  isActive ? "bg-primary/5 text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -top-1 h-1 w-8 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  )}
                />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
});
