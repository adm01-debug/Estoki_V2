import { forwardRef, memo } from 'react';
  import { DashboardSkeleton, TableSkeleton, FormSkeleton, ListSkeleton, CardSkeleton, EstoqueSkeleton, SkeletonPulse } from './PageSkeleton';
import { LoadingFallback } from './LoadingFallback';

  type PageType = 'dashboard' | 'estoque' | 'hub' | 'table' | 'form' | 'list' | 'card' | 'default';
 
 interface RouteLoadingFallbackProps {
  type?: PageType;
}

/**
 * Route-specific loading fallback that shows contextual skeletons
 * based on the type of page being loaded.
 */
  import { motion, AnimatePresence } from "framer-motion";
 
 export const RouteLoadingFallback = memo(
   forwardRef<HTMLDivElement, RouteLoadingFallbackProps>(
     function RouteLoadingFallback({ type = 'default' }, ref) {
       const content = (() => {
         switch (type) {
            case 'dashboard':
              return <DashboardSkeleton />;
            case 'hub':
              return <div className="p-4 md:p-6 lg:p-8 space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-2">
                    <SkeletonPulse className="h-8 w-48" />
                    <SkeletonPulse className="h-4 w-64" />
                  </div>
                  <SkeletonPulse className="h-10 w-40 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SkeletonPulse className="h-32 rounded-xl" />
                  <SkeletonPulse className="h-32 rounded-xl" />
                  <SkeletonPulse className="h-32 rounded-xl" />
                </div>
                <div className="space-y-4 pt-4">
                  <SkeletonPulse className="h-6 w-32" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonPulse key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              </div>;
            case 'estoque':
              return <EstoqueSkeleton />;
           case 'table':
             return <TableSkeleton />;
           case 'form':
             return <FormSkeleton />;
           case 'list':
             return <div className="p-4"><ListSkeleton /></div>;
           case 'card':
             return <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
           default:
             return <LoadingFallback />;
         }
       })();
 
        return (
          <AnimatePresence mode="wait">
            <motion.div 
              ref={ref}
              key={type}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ 
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="w-full will-change-transform"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        );
     }
   )
 );
