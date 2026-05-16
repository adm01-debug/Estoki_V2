import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, X, ArrowLeft } from "lucide-react";
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
  onBack
}: MobileNavigationProps) {
  return (
    <>
      {/* FAB Overlay */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
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
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:hidden w-full max-w-[calc(100%-2rem)]">
            <motion.div 
              className="flex flex-wrap justify-center gap-3 p-4 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }} 
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {fabActions.map((action, i) => (
                <motion.button 
                  key={action.path} 
                  onClick={() => { setFabOpen(false); onNavigate(action.path); }}
                  className="flex flex-col items-center gap-2 w-20 py-3 rounded-2xl hover:bg-primary/10 transition-colors active:scale-95"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground text-center line-clamp-1 px-1">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      <nav
        className="fixed bottom-0 left-0 right-0 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 md:hidden z-40"
        aria-label="Navegação mobile"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl border-t border-border/10 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]" />
        <div className="relative flex items-center justify-between h-16 max-w-md mx-auto px-1">
          {/* Contextual Back/Hub Button */}
          {(pathname === "/" || pathname === "/dashboard") ? (
            <motion.button
              onClick={() => onNavigate("/hub")}
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] px-2 rounded-2xl text-muted-foreground hover:text-primary transition-all active:bg-primary/10"
              aria-label="Hub"
            >
              <Box className="h-6 w-6 opacity-70" />
              <span className="text-[10px] font-extrabold uppercase tracking-tighter">Hub</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => onBack?.()}
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] px-2 rounded-2xl text-muted-foreground hover:text-primary transition-all active:bg-primary/10"
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
                onClick={() => onNavigate(item.path)}
                whileTap={{ scale: 0.9 }} 
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] px-2 rounded-2xl transition-all duration-200 relative",
                  isActive ? "text-primary bg-primary/5" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-indicator" 
                    className="absolute -top-2 w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                  />
                )}
                <item.icon className={cn("h-6 w-6", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                <span className={cn("text-[10px] uppercase tracking-tighter", isActive ? "font-black" : "font-bold")}>{item.label}</span>
              </motion.button>
            );
          })}

          {/* FAB Center Action */}
          <div className="relative -mt-10">
            <motion.button 
              onClick={() => setFabOpen(!fabOpen)} 
              whileTap={{ scale: 0.85 }}
              className={cn(
                "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-glow-lg transition-all duration-500 border-4 border-background",
                fabOpen ? "bg-destructive rotate-45 scale-90" : "bg-primary"
              )} 
              aria-label={fabOpen ? "Fechar ações rápidas" : "Ações rápidas"}
            >
              <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                {fabOpen ? <X className="h-7 w-7 text-destructive-foreground" /> : <Box className="h-7 w-7 text-primary-foreground" />}
              </motion.div>
            </motion.button>
          </div>

          {mobileNavItems.slice(2, 4).map((item) => {
            const isActive = pathname === item.path;
            return (
              <motion.button 
                key={item.path} 
                onClick={() => onNavigate(item.path)}
                whileTap={{ scale: 0.9 }} 
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] px-2 rounded-2xl transition-all duration-200 relative",
                  isActive ? "text-primary bg-primary/5" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-indicator" 
                    className="absolute -top-2 w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                  />
                )}
                <item.icon className={cn("h-6 w-6", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                <span className={cn("text-[10px] uppercase tracking-tighter", isActive ? "font-black" : "font-bold")}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
});