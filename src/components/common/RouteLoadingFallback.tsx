import { forwardRef, memo } from 'react';
 import { DashboardSkeleton, TableSkeleton, FormSkeleton, ListSkeleton, CardSkeleton } from './PageSkeleton';
import { LoadingFallback } from './LoadingFallback';

 type PageType = 'dashboard' | 'table' | 'form' | 'list' | 'card' | 'default';
 
 interface RouteLoadingFallbackProps {
  type?: PageType;
}

/**
 * Route-specific loading fallback that shows contextual skeletons
 * based on the type of page being loaded.
 */
 import { motion } from "framer-motion";
 
 export const RouteLoadingFallback = memo(
   forwardRef<HTMLDivElement, RouteLoadingFallbackProps>(
     function RouteLoadingFallback({ type = 'default' }, ref) {
       const content = (() => {
         switch (type) {
           case 'dashboard':
             return <DashboardSkeleton />;
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
         <motion.div 
           ref={ref}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.3 }}
           className="w-full"
         >
           {content}
         </motion.div>
       );
     }
   )
 );
