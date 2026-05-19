import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card border-border/30 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="mt-4 h-1.5 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* AI Insights Mock */}
          <Card className="rounded-3xl border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wide Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <Skeleton className="h-12 w-20 rounded-xl" />
              </CardContent>
            </Card>
            <Card className="glass-card border-success/20 bg-success/5">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-4">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Area */}
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-4 border-b border-border/20">
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Activity Feed Skeleton */}
          <Card className="rounded-[32px] border-border/40 shadow-sm overflow-hidden bg-background/50">
            <CardHeader className="pb-3 border-b border-border/10 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-2 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-3 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Health HUD Skeleton */}
          <Card className="rounded-[32px] border-border/40 bg-muted/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-4/5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});
