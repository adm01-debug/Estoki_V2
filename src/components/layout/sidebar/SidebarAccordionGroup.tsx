import { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarNavButton } from "./SidebarNavButton";
import type { SidebarGroup } from "./sidebarNavData";

interface SidebarAccordionGroupProps {
  group: SidebarGroup;
  collapsed: boolean;
  pathname: string;
  onNavigate: (path: string) => void;
  onHover?: (path: string) => void;
}

export const SidebarAccordionGroup = memo(function SidebarAccordionGroup({
  group,
  collapsed,
  pathname,
  onNavigate,
  onHover,
}: SidebarAccordionGroupProps) {
  const hasActiveChild = group.items.some(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/")
  );
  const [open, setOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  if (collapsed) {
    return (
      <>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="mx-3 my-1 flex items-center justify-center">
              <group.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  hasActiveChild ? "text-primary" : "text-sidebar-foreground/30"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="border-border bg-popover font-medium text-popover-foreground"
          >
            {group.label}
          </TooltipContent>
        </Tooltip>
        {group.items.map((item) => (
          <SidebarNavButton
            key={item.path}
            item={item}
            isActive={pathname === item.path}
            onClick={() => onNavigate(item.path)}
            collapsed={true}
            onHover={onHover}
          />
        ))}
      </>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "group/trigger mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200",
            hasActiveChild
              ? "text-primary"
              : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <group.icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              hasActiveChild
                ? "text-primary"
                : "text-sidebar-foreground/30 group-hover/trigger:text-sidebar-foreground/60"
            )}
          />
          <span
            className={cn(
              "flex-1 text-left text-xs font-bold uppercase tracking-wider",
              hasActiveChild ? "text-primary/80" : ""
            )}
          >
            {group.label}
          </span>
          {hasActiveChild && (
            <span className="inline-flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
          )}
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
              open && "rotate-90"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 overflow-hidden pl-1 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        {group.items.map((item) => (
          <SidebarNavButton
            key={item.path}
            item={item}
            isActive={pathname === item.path}
            onClick={() => onNavigate(item.path)}
            collapsed={false}
            onHover={onHover}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});
