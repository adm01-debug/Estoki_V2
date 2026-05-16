import { cn } from "@/lib/utils";
import { memo } from "react";

  import { motion } from "framer-motion";
 
  function SkeletonPulse({ className }: { className?: string }) {
    return (
      <motion.div 
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "rounded-lg bg-muted shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]", 
          className
        )} 
      />
    );
  }

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border space-y-3">
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-8 w-16" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <SkeletonPulse className="h-5 w-32" />
          <SkeletonPulse className="h-52" />
        </div>
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <SkeletonPulse className="h-5 w-32" />
          <SkeletonPulse className="h-52" />
        </div>
      </div>
      {/* Activity feed */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <SkeletonPulse className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonPulse className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-3/4" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
          </div>
        ))}
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
