import { memo } from "react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "gradient";
  badge?: number;
}

export const MenuButton = memo(function MenuButton({
  icon: Icon,
  label,
  description,
  onClick,
  variant = "default",
  badge,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label}${description ? ` - ${description}` : ""}${badge ? ` (${badge} pendentes)` : ""}`}
      className={cn(
        "menu-button group relative w-full overflow-hidden",
        variant === "primary" && "border-primary/30 bg-primary/5",
        variant === "gradient" && "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5"
      )}
    >
      {/* Hover shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <div className="relative z-10 flex w-full items-center gap-4">
        <div
          className={cn(
            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110",
            variant === "primary" || variant === "gradient"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-7 w-7" />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-destructive-foreground">
                {badge}
              </span>
            )}
          </div>
          {description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </button>
  );
});
