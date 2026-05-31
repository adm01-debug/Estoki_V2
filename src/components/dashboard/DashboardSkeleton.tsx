import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { memo } from "react";

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card overflow-hidden rounded-[32px] border-border/30">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-xl" />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="rounded-[32px] border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-24 rounded-[32px]" />
            <Skeleton className="h-24 rounded-[32px]" />
          </div>

          <Card className="glass-card rounded-[32px] border-border/30">
            <CardHeader className="border-b border-border/20 pb-4">
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-[400px] rounded-[32px]" />
          <Skeleton className="h-[200px] rounded-[32px]" />
        </div>
      </div>
    </div>
  );
});
