import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, ArrowLeft, MoreHorizontal } from "lucide-react";
import { haptics } from "@/utils/haptics";
import { cn } from "@/lib/utils";
import { mobileNavItems, fabActions } from "@/components/layout/sidebar";

interface MobileNavigationProps {
  fabOpen: boolean;
  setFabOpen: (open: boolean) => void;
  pathname: string;
  onNavigate: (path: string) => void;
  onBack?: () => void;
}

/**
 * MobileNavigation Organism
 * Optimized for mobile touch experience with FAB and bottom nav.
 */
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
          <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 md:hidden">
            <motion.div
              className="flex flex-wrap justify-center gap-3 rounded-3xl border border-border/50 bg-card/95 p-4 shadow-2xl backdrop-blur-xl"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {fabActions.map((action, i) => (
                <motion.button
                  key={action.path}
                  onClick={() => {
                    haptics.light();
                    setFabOpen(false);
                    onNavigate(action.path);
                  }}
                  className="flex w-[72px] flex-col items-center gap-2 rounded-2xl py-3 transition-colors hover:bg-primary/10 active:scale-95 sm:w-20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="line-clamp-1 px-1 text-center text-[10px] font-bold text-foreground">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 md:hidden"
        aria-label="Navegação mobile"
      >
        <div className="absolute inset-0 border-t border-border/10 bg-background/80 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl" />
        <div className="relative mx-auto flex h-16 max-w-md items-center justify-between px-1">
          {/* Contextual Back/Hub Button */}
          {pathname === "/" || pathname === "/dashboard" ? (
            <motion.button
              onClick={() => {
                haptics.light();
                onNavigate("/hub");
              }}
              whileTap={{ scale: 0.85 }}
              className="flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-muted-foreground transition-all hover:text-primary active:bg-primary/10"
              aria-label="Hub"
            >
              <Box className="h-6 w-6 opacity-70" />
              <span className="text-[10px] font-extrabold uppercase tracking-tighter">Hub</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => {
                haptics.light();
                onBack?.();
              }}
              whileTap={{ scale: 0.85 }}
              className="flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-muted-foreground transition-all hover:text-primary active:bg-primary/10"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="text-[10px] font-extrabold uppercase tracking-tighter">Voltar</span>
            </motion.button>
          )}

          {mobileNavItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  haptics.light();
                  onNavigate(item.path);
                }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-all duration-200",
                  isActive ? "bg-primary/5 text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -top-2 h-1 w-8 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-6 w-6",
                    isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-tighter",
                    isActive ? "font-black" : "font-bold"
                  )}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}

          {/* FAB Center Action */}
          <div className="relative -mt-10">
            <motion.button
              onClick={() => {
                haptics.medium();
                setFabOpen(!fabOpen);
              }}
              whileTap={{ scale: 0.85 }}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-[2rem] border-4 border-background shadow-glow-lg transition-all duration-500",
                fabOpen ? "rotate-45 scale-90 bg-destructive" : "bg-primary"
              )}
              aria-label={fabOpen ? "Fechar ações rápidas" : "Ações rápidas"}
            >
              <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                {fabOpen ? (
                  <X className="h-7 w-7 text-destructive-foreground" />
                ) : (
                  <Box className="h-7 w-7 text-primary-foreground" />
                )}
              </motion.div>
            </motion.button>
          </div>

          {mobileNavItems.slice(2, 4).map((item) => {
            const isActive = pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  haptics.light();
                  onNavigate(item.path);
                }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-all duration-200",
                  isActive ? "bg-primary/5 text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -top-2 h-1 w-8 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-6 w-6",
                    isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-tighter",
                    isActive ? "font-black" : "font-bold"
                  )}
                >
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
