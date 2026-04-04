/**
 * ESTOKI — Unified Loading Patterns
 * 
 * Usage guide:
 * - PageSkeleton: Full page loading (route transitions)
 * - CardSkeleton: Individual card loading
 * - TableSkeleton: Table/list data loading
 * - BrandedSpinner: Action feedback (form submit, data save)
 * - InlineLoader: Inline text loading indicator
 */

import { cn } from "@/lib/utils";
import { Box, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// ── Skeleton Base ────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted rounded", className)} />;
}

// ── Card Skeleton ────────────────────────────────────────

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/40 bg-card/80 p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-8 w-1/3" />
    </div>
  );
}

// ── KPI Grid Skeleton ────────────────────────────────────

export function KPIGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Table Skeleton ───────────────────────────────────────

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden">
      <div className="flex gap-4 p-4 bg-muted/30 border-b border-border/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 p-4 border-b border-border/20 last:border-0">
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Page Skeleton ────────────────────────────────────────

export function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 hidden sm:block" />
      </div>
      <KPIGridSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

// ── Branded Spinner (ESTOKI Box icon) ────────────────────

export function BrandedSpinner({
  size = "md",
  text,
  className,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}) {
  const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };
  const iconSizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <motion.div
        className={cn("rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow", sizes[size])}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Box className={cn("text-primary-foreground", iconSizes[size])} />
      </motion.div>
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
}

// ── Full Page Branded Loading ────────────────────────────

export function FullPageLoader({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <BrandedSpinner size="lg" text={text} />
    </div>
  );
}

// ── Inline Loader ────────────────────────────────────────

export function InlineLoader({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin text-muted-foreground", className)} />
  );
}
