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
  badge
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label}${description ? ` - ${description}` : ''}${badge ? ` (${badge} pendentes)` : ''}`}
      className={cn(
        "menu-button w-full group relative overflow-hidden",
        variant === "primary" && "border-primary/30 bg-primary/5",
        variant === "gradient" && "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5"
      )}
    >
      {/* Hover shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      
      <div className="relative z-10 flex items-center gap-4 w-full">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110",
          variant === "primary" || variant === "gradient"
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
            : "bg-primary/10 text-primary"
        )}>
          <Icon className="h-7 w-7" />
        </div>
        
        <div className="flex-1 text-left">
          <div className="font-semibold text-foreground flex items-center gap-2">
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
          )}
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </button>
  );
});
