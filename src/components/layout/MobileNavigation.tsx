import { motion, AnimatePresence } from "framer-motion";
import { Box, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavItems, fabActions } from "./sidebar";

interface MobileNavigationProps {
  fabOpen: boolean;
  setFabOpen: (open: boolean) => void;
  pathname: string;
  onNavigate: (path: string) => void;
}

export function MobileNavigation({
  fabOpen,
  setFabOpen,
  pathname,
  onNavigate
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
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 md:hidden">
            <motion.div 
              className="flex gap-3 p-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }} 
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {fabActions.map((action, i) => (
                <motion.button 
                  key={action.path} 
                  onClick={() => { setFabOpen(false); onNavigate(action.path); }}
                  className="flex flex-col items-center gap-1.5 w-16 py-2 rounded-xl hover:bg-primary/10 transition-colors"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} 
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
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
        className="sticky bottom-0 border-t border-border/40 px-1 py-1 md:hidden safe-area-bottom relative" 
        aria-label="Navegação mobile"
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl" />
        <div className="relative flex items-center justify-around">
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
                  "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] px-2 py-1.5 rounded-xl transition-all duration-200 relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-indicator" 
                    className="absolute -top-1 w-8 h-1 bg-primary rounded-full" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
              </motion.button>
            );
          })}

          {/* FAB Center */}
          <div className="relative -mt-5">
            <motion.button 
              onClick={() => setFabOpen(!fabOpen)} 
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow transition-all duration-300",
                fabOpen ? "bg-destructive rotate-45" : "bg-gradient-to-br from-primary to-primary/80"
              )} 
              aria-label={fabOpen ? "Fechar ações rápidas" : "Ações rápidas"}
            >
              <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                {fabOpen ? <X className="h-6 w-6 text-destructive-foreground" /> : <Box className="h-6 w-6 text-primary-foreground" />}
              </motion.div>
            </motion.button>
          </div>

          {mobileNavItems.slice(2).map((item) => {
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
                  "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] px-2 py-1.5 rounded-xl transition-all duration-200 relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobile-indicator" 
                    className="absolute -top-1 w-8 h-1 bg-primary rounded-full" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                  />
                )}
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}