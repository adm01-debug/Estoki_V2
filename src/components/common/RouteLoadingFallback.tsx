import { forwardRef, memo } from 'react';
 import { DashboardSkeleton, TableSkeleton, FormSkeleton, ListSkeleton, CardSkeleton } from './PageSkeleton';
import { LoadingFallback } from './LoadingFallback';

 type PageType = 'dashboard' | 'table' | 'form' | 'list' | 'card' | 'default';
         case 'list':
           return <div ref={ref} className="p-4"><ListSkeleton /></div>;
         case 'card':
           return <div ref={ref} className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;

interface RouteLoadingFallbackProps {
  type?: PageType;
}

/**
 * Route-specific loading fallback that shows contextual skeletons
 * based on the type of page being loaded.
 */
export const RouteLoadingFallback = memo(
  forwardRef<HTMLDivElement, RouteLoadingFallbackProps>(
    function RouteLoadingFallback({ type = 'default' }, ref) {
      switch (type) {
        case 'dashboard':
          return <div ref={ref}><DashboardSkeleton /></div>;
        case 'table':
          return <div ref={ref}><TableSkeleton /></div>;
        case 'form':
          return <div ref={ref}><FormSkeleton /></div>;
        default:
          return <LoadingFallback ref={ref} />;
      }
    }
  )
);
