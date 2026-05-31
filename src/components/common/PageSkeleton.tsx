import { cn } from "@/lib/utils";
import { memo } from "react";
import { motion } from "framer-motion";

export const EstoqueSkeleton = memo(function EstoqueSkeleton() {
   return (
     <div className="p-4 md:p-6 lg:p-8 space-y-6">
       {/* Header Actions */}
       <div className="flex justify-between items-center mb-4">
         <div className="space-y-2">
           <SkeletonPulse className="h-6 w-48" />
           <SkeletonPulse className="h-4 w-64" />
         </div>
         <div className="flex gap-2">
           <SkeletonPulse className="h-10 w-32 rounded-xl" />
           <SkeletonPulse className="h-10 w-24 rounded-xl" />
         </div>
       </div>
 
       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {Array.from({ length: 4 }).map((_, i) => (
           <SkeletonPulse key={i} className="h-32 w-full rounded-3xl" />
         ))}
       </div>
 
       {/* Charts Section */}
       <SkeletonPulse className="h-64 w-full rounded-[32px]" />
 
       {/* Search and Filters */}
       <div className="flex gap-3">
         <SkeletonPulse className="h-11 flex-1 rounded-xl" />
         <SkeletonPulse className="h-11 w-28 rounded-xl" />
       </div>
 
       {/* Tabs List */}
       <SkeletonPulse className="h-12 w-full rounded-2xl" />
 
       {/* Tab Content (Map view skeleton) */}
       <div className="grid lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2">
           <SkeletonPulse className="h-[600px] rounded-[32px]" />
         </div>
         <div className="space-y-4">
           <SkeletonPulse className="h-48 rounded-[32px]" />
           <SkeletonPulse className="h-48 rounded-[32px]" />
           <SkeletonPulse className="h-48 rounded-[32px]" />
         </div>
       </div>
     </div>
   );
 });
 
export function SkeletonPulse({ className, delay = 0 }: { className?: string; delay?: number }) {
    return (
    <motion.div 
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "linear",
        delay: delay 
      }}
      className={cn(
        "rounded-lg bg-muted/40 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent", 
        className
      )} 
    />
    );
  }

export const DashboardSkeleton = memo(function DashboardSkeleton() {
   return (
     <div className="p-4 md:p-6 lg:p-8 space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div className="space-y-2">
           <SkeletonPulse className="h-4 w-32" />
           <SkeletonPulse className="h-3 w-48" />
         </div>
         <div className="flex gap-2">
           <SkeletonPulse className="h-10 w-28 rounded-xl" />
           <SkeletonPulse className="h-10 w-32 rounded-xl" />
         </div>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 space-y-6">
           {/* AI Insights Skeleton */}
           <SkeletonPulse className="h-32 w-full rounded-[32px]" />
           
           {/* KPI Cards Skeleton */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {Array.from({ length: 4 }).map((_, i) => (
               <SkeletonPulse key={i} className="h-36 w-full rounded-3xl" />
             ))}
           </div>
           
           {/* Charts Skeleton */}
           <div className="grid lg:grid-cols-2 gap-4">
             <SkeletonPulse className="h-80 rounded-[32px]" />
             <SkeletonPulse className="h-80 rounded-[32px]" />
           </div>
           <SkeletonPulse className="h-80 rounded-[32px]" />
         </div>
         
         <div className="lg:col-span-4 space-y-6">
           {/* Activity Feed Skeleton */}
           <SkeletonPulse className="h-[500px] rounded-[32px]" />
           
           {/* Shortcuts Skeleton */}
           <SkeletonPulse className="h-48 rounded-[32px]" />
           
           {/* System Health Skeleton */}
           <SkeletonPulse className="h-32 rounded-[32px]" />
         </div>
       </div>
     </div>
   );
 });
 
export const ListSkeleton = memo(function ListSkeleton() {
   return (
     <div className="space-y-4">
       {Array.from({ length: 5 }).map((_, i) => (
         <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
           <SkeletonPulse className="h-10 w-10 rounded-full shrink-0" />
           <div className="flex-1 space-y-2">
             <SkeletonPulse className="h-4 w-1/3" />
             <SkeletonPulse className="h-3 w-1/2" />
           </div>
         </div>
       ))}
     </div>
   );
 });
 
export const CardSkeleton = memo(function CardSkeleton() {
   return (
     <div className="p-4 rounded-xl bg-card border border-border space-y-3">
       <SkeletonPulse className="h-4 w-1/3" />
       <SkeletonPulse className="h-8 w-2/3" />
       <SkeletonPulse className="h-3 w-1/2" />
     </div>
   );
 });

export const TableSkeleton = memo(function TableSkeleton() {
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
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-4 w-32" />
        <div className="flex gap-2">
          <SkeletonPulse className="h-9 w-9 rounded-md" />
          <SkeletonPulse className="h-9 w-9 rounded-md" />
          <SkeletonPulse className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
});

export const FormSkeleton = memo(function FormSkeleton() {
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
});

export const ScannerSkeleton = memo(function ScannerSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <SkeletonPulse className="h-8 w-40" />
      <div className="flex flex-col items-center gap-6">
        <SkeletonPulse className="h-64 w-64 rounded-2xl" />
        <SkeletonPulse className="h-12 w-48 rounded-full" />
        <SkeletonPulse className="h-4 w-60" />
      </div>
    </div>
  );
});

export const MapSkeleton = memo(function MapSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <SkeletonPulse className="h-8 w-48" />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SkeletonPulse className="h-96 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-card border border-border space-y-2">
              <SkeletonPulse className="h-4 w-20" />
              <SkeletonPulse className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
