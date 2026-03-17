import { cn } from "@/lib/utils";

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border space-y-3">
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-8 w-16" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <SkeletonPulse className="h-64" />
        <SkeletonPulse className="h-64" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-8 w-48" />
        <SkeletonPulse className="h-10 w-32" />
      </div>
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <SkeletonPulse className="h-10 flex-1" />
          <SkeletonPulse className="h-10 w-28" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-0 flex items-center gap-4">
            <SkeletonPulse className="h-5 w-5 rounded" />
            <SkeletonPulse className="h-4 flex-1" />
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-4 w-16" />
            <SkeletonPulse className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <SkeletonPulse className="h-8 w-48" />
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-10 w-full" />
          </div>
        ))}
        <SkeletonPulse className="h-10 w-32 mt-4" />
      </div>
    </div>
  );
}
