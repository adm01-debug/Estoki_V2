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

export function MenuButton({ 
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
        "premium-glass w-full group relative overflow-hidden p-4 text-left transition-all duration-500 hover:shadow-premium-lg hover:border-primary/30",
        variant === "primary" && "bg-primary/5",
        variant === "gradient" && "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
      )}
    >
      {/* Decorative background circle */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="relative z-10 flex items-center gap-4 w-full">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
          variant === "primary" || variant === "gradient"
            ? "bg-primary text-primary-foreground shadow-glow" 
            : "bg-primary/10 text-primary border border-primary/20"
        )}>
          <Icon className="h-7 w-7" />
        </div>
        
        <div className="flex-1">
          <div className="font-black text-foreground text-base flex items-center gap-2 tracking-tight group-hover:text-primary transition-colors">
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="inline-flex items-center justify-center h-5 px-2 text-[10px] font-black bg-destructive text-destructive-foreground rounded-full shadow-lg shadow-destructive/20 animate-pulse">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <div className="text-overline text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">{description}</div>
          )}
        </div>
        
        <div className="w-8 h-8 rounded-full bg-border/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500">
          <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-500" />
        </div>
      </div>
    </button>
  );
}
