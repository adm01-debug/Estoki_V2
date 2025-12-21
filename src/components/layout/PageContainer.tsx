import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidths = { sm: "max-w-3xl", md: "max-w-4xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-full" };

export function PageContainer({ children, className, maxWidth = "xl" }: PageContainerProps) {
  return (
    <div className={cn("mx-auto px-4 py-6", maxWidths[maxWidth], className)}>
      {children}
    </div>
  );
}
