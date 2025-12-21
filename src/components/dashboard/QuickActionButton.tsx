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

export function QuickActionButton({ icon: Icon, label, onClick, variant = "outline", className }: QuickActionButtonProps) {
  return (
    <Button
      variant={variant}
      size="lg"
      onClick={onClick}
      className={cn("flex-col h-auto py-4 px-6 gap-2", className)}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
