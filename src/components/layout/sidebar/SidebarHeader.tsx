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
     <div className={cn("px-4 h-16 flex items-center border-b border-sidebar-border/30", isCollapsed && "px-2")}>
      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
         <div className="flex items-center gap-3">
           <motion.div
             className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 flex items-center justify-center shadow-glow shrink-0"
             whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
             transition={{ duration: 0.5 }}
           >
             <Box className="h-5 w-5 text-primary-foreground" />
           </motion.div>
           {!isCollapsed && (
             <div className="min-w-0 flex flex-col">
               <h1 className="font-extrabold text-sidebar-foreground text-lg tracking-tight leading-none gradient-text">ESTOKI</h1>
               <p className="text-[9px] text-sidebar-foreground/40 font-bold tracking-widest uppercase mt-1">Intelligent WMS</p>
             </div>
           )}
         </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onCloseMobile} className="ml-auto text-sidebar-foreground/50 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
});
