import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
  className?: string;
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "outline",
  className,
}: QuickActionButtonProps) {
  return (
    <Button
      variant={variant}
      size="lg"
      onClick={onClick}
      className={cn("h-auto flex-col gap-2 px-6 py-4", className)}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
