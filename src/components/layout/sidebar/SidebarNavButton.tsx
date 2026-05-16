import { memo } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import type { NavItem } from "./sidebarNavData";

interface SidebarNavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
  onHover?: (path: string) => void;
}

export const SidebarNavButton = memo(function SidebarNavButton({ item, isActive, onClick, collapsed, onHover }: SidebarNavButtonProps) {
  const className = cn(
     "w-full flex items-center gap-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
     collapsed ? "px-0 h-11 w-11 mx-auto justify-center" : "px-3 py-2.5",
    isActive
      ? "bg-primary/15 text-primary"
      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80"
  );

  const content = (
    <>
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className={cn(
        "relative flex items-center justify-center",
        isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
      )}>
        <item.icon className={cn(
          "h-[18px] w-[18px] shrink-0 transition-all duration-200",
          isActive ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
        )} />
      </div>
      {!collapsed && (
        <span className={cn(
          "text-sm transition-colors truncate",
          isActive ? "font-semibold" : "font-medium"
        )}>{item.label}</span>
      )}
      {item.badge && item.badge > 0 && !collapsed && (
        <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
          {item.badge}
        </span>
      )}
    </>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button type="button" onClick={onClick} onMouseEnter={() => onHover?.(item.path)} data-tour={item.tour} className={className}>
            {content}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

   return (
     <motion.button
       data-tour={item.tour}
       onClick={onClick}
       onMouseEnter={() => onHover?.(item.path)}
       whileHover={{ x: 4 }}
       whileTap={{ scale: 0.97 }}
       className={className}
       aria-current={isActive ? "page" : undefined}
     >
       {content}
     </motion.button>
   );
});
