import { forwardRef, memo } from 'react';
import { DashboardSkeleton, TableSkeleton, FormSkeleton } from './PageSkeleton';
import { LoadingFallback } from './LoadingFallback';

type PageType = 'dashboard' | 'table' | 'form' | 'default';

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
