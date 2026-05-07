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
  onCloseMobile 
}: SidebarHeaderProps) {
  return (
    <div className={cn("p-4 border-b border-sidebar-border/50", isCollapsed && "p-3")}>
      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 flex items-center justify-center shadow-glow shrink-0"
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <Box className="h-5 w-5 text-primary-foreground" />
        </motion.div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h1 className="font-extrabold text-sidebar-foreground text-base tracking-tight gradient-text">ESTOKI</h1>
            <p className="text-[10px] text-sidebar-foreground/30 font-medium tracking-wide">ESTOQUE INTELIGENTE</p>
          </div>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onCloseMobile} className="ml-auto text-sidebar-foreground/50 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
});
