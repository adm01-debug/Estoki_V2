import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import type { NavItem } from "./sidebarNavData";
import { useSound } from "@/hooks/useSound";
import { useHaptics } from "@/hooks/useHaptics";

interface SidebarNavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
  onHover?: (path: string) => void;
}

export const SidebarNavButton = memo(function SidebarNavButton({
  item,
  isActive,
  onClick,
  collapsed,
  onHover,
}: SidebarNavButtonProps) {
  const { play } = useSound();
  const haptics = useHaptics();

  const handleClick = useCallback(() => {
    haptics.light();
    play("notification", 0.1); // Subtle sound for navigation
    onClick();
  }, [haptics, play, onClick]);

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
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div
        className={cn(
          "relative flex items-center justify-center",
          isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
        )}
      >
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-all duration-200",
            isActive
              ? "text-primary"
              : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
          )}
        />
      </div>
      {!collapsed && (
        <span
          className={cn(
            "truncate text-sm transition-colors",
            isActive ? "font-semibold" : "font-medium"
          )}
        >
          {item.label}
        </span>
      )}
      {item.badge && item.badge > 0 && !collapsed && (
        <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
          {item.badge}
        </span>
      )}
    </>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            onMouseEnter={() => onHover?.(item.path)}
            data-tour={item.tour}
            className={className}
          >
            {content}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="border-border bg-popover font-medium text-popover-foreground"
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.button
      data-tour={item.tour}
      onClick={handleClick}
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
