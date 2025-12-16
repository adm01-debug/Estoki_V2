import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: "default" | "primary";
}

export function MenuButton({ 
  icon: Icon, 
  label, 
  description,
  onClick,
  variant = "default"
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "menu-button w-full",
        variant === "primary" && "border-primary/30 bg-primary/5"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center",
        variant === "primary" 
          ? "bg-primary text-primary-foreground" 
          : "bg-primary/10 text-primary"
      )}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-center">
        <div className="font-semibold text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        )}
      </div>
    </button>
  );
}
