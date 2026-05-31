import { memo } from "react";
import { Box, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onCloseMobile: () => void;
}

export const SidebarHeader = memo(function SidebarHeader({
  isCollapsed,
  isMobile,
  onCloseMobile,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[100px] items-center border-b border-sidebar-border/30 px-4",
        isCollapsed && "h-16 min-h-[64px] px-2"
      )}
    >
      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 shadow-glow transition-all duration-300",
                  isCollapsed ? "h-10 w-10" : "h-[68px] w-[68px]"
                )}
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  className={cn(
                    "text-primary-foreground transition-all duration-300",
                    isCollapsed ? "h-5 w-5" : "h-9 w-9"
                  )}
                />
              </motion.div>
              {!isCollapsed && (
                <div className="flex min-w-0 flex-col justify-center">
                  <h1 className="gradient-text text-[22px] font-black leading-[0.8] tracking-tighter text-sidebar-foreground">
                    PROMO
                  </h1>
                  <p className="mt-1.5 text-[13px] font-black uppercase leading-none tracking-[0.25em] text-primary">
                    BRINDES
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <p className="ml-0.5 mt-1 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40">
                INTELLIGENCE WMS
              </p>
            )}
          </div>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="ml-auto text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
});
