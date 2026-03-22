import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export default function SkeletonLoader({ lines = 3, className }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
