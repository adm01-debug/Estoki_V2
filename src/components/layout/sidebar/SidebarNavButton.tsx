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
    "w-full flex items-center gap-3 rounded-2xl transition-all duration-500 group relative",
    collapsed ? "px-3 py-4 justify-center" : "px-4 py-3",
    isActive
      ? "bg-primary/10 text-primary shadow-glow-sm border border-primary/20"
      : "text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-white/[0.03]"
  );

  const content = (
    <>
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_12px_hsl(var(--primary))]"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className={cn(
        "relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
        isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
      )}>
        <item.icon className={cn(
          "h-5 w-5 shrink-0 transition-all duration-500",
          isActive ? "text-primary" : "text-current"
        )} />
      </div>
      {!collapsed && (
        <span className={cn(
          "text-sm transition-all truncate tracking-tight",
          isActive ? "font-black" : "font-semibold"
        )}>{item.label}</span>
      )}
      {item.badge && item.badge > 0 && !collapsed && (
        <span className="ml-auto inline-flex items-center justify-center h-5 px-2 text-[10px] font-black bg-destructive text-destructive-foreground rounded-full shadow-lg shadow-destructive/20 animate-pulse">
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
    >
      {content}
    </motion.button>
  );
});
