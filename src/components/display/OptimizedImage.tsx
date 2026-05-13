 import React, { useState } from 'react';
 import { cn } from '@/lib/utils';
 import { Skeleton } from '@/components/ui/skeleton';
 import { ImageOff } from 'lucide-react';
 
 interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
   fallback?: React.ReactNode;
 }
 
 export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
   src, 
   alt, 
   className, 
   fallback,
   loading = 'lazy',
   decoding = 'async',
   ...props 
 }) => {
   const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
 
   return (
     <div className={cn("relative overflow-hidden bg-muted flex items-center justify-center", className)}>
       {status === 'loading' && (
         <Skeleton className="absolute inset-0 z-10" />
       )}
       
       {status === 'error' ? (
         fallback || (
           <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
             <ImageOff className="h-8 w-8" />
             <span className="text-xs">Falha ao carregar imagem</span>
           </div>
         )
       ) : (
         <img
           src={src}
           alt={alt || "Imagem"}
           loading={loading}
           decoding={decoding}
           className={cn(
             "transition-opacity duration-300",
             status === 'loaded' ? "opacity-100" : "opacity-0",
             className
           )}
           onLoad={() => setStatus('loaded')}
           onError={() => setStatus('error')}
           {...props}
         />
       )}
     </div>
   );
 };