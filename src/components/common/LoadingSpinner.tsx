import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function LoadingSpinner({
  size = "md",
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Componente para loading de página inteira
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text="Carregando..." />
    </div>
  );
}

// Componente para loading inline
export function InlineLoading({ text = "Carregando..." }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </span>
  );
}

// Componente para loading de botão
export function ButtonLoading() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}
