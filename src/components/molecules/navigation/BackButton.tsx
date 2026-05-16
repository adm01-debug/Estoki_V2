import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * BackButton Molecule
 * Robust back navigation with history detection and fallback.
 */
export const BackButton = ({ 
  className, 
  fallbackPath = "/dashboard", 
  variant = "ghost",
  size = "icon"
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = useCallback(() => {
    // Haptic feedback if supported
    if (window.navigator.vibrate) {
      window.navigator.vibrate([5, 10, 5]);
    }

    // Check if there's history to go back to
    // window.history.state.idx > 0 is a reliable way to check if we can go back within our app
    const canGoBack = window.history.state && window.history.state.idx > 0;

    if (canGoBack) {
      navigate(-1);
    } else {
      // If no history, navigate to fallback or parent
      const segments = location.pathname.split("/").filter(Boolean);
      const parentRoute = segments.length > 1 
        ? "/" + segments.slice(0, -1).join("/") 
        : fallbackPath;
      
      navigate(parentRoute, { replace: true });
    }
  }, [navigate, location.pathname, fallbackPath]);

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn("inline-block", className)}
        >
          <Button
            variant={variant}
            size={size}
            onClick={handleBack}
            className="touch-friendly bg-background/50 border border-border/20 shadow-sm hover:bg-primary/10 transition-colors"
            aria-label="Voltar para tela anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-wider bg-popover/95 backdrop-blur-md border-border/40">
        Voltar <kbd className="ml-2 px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Alt+←</kbd>
      </TooltipContent>
    </Tooltip>
  );
};