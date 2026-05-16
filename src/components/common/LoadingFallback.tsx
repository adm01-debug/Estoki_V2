 import { forwardRef } from 'react';
 import { Loader2 } from 'lucide-react';
 import { motion } from 'framer-motion';
 
 export const LoadingFallback = forwardRef<HTMLDivElement>(function LoadingFallback(_props, ref) {
   return (
     <div ref={ref} className="min-h-[60vh] flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl border border-border/10 p-12">
       <motion.div 
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1 }}
         className="text-center"
       >
         <div className="relative mb-6">
           <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
           <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10 mx-auto" />
         </div>
         <motion.h3 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-xl font-bold text-foreground mb-2"
         >
           Sincronizando Dados
         </motion.h3>
         <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 0.7 }}
           transition={{ delay: 0.4 }}
           className="text-muted-foreground max-w-[200px] mx-auto text-sm leading-relaxed"
         >
           Preparando ambiente seguro e eficiente...
         </motion.p>
       </motion.div>
     </div>
   );
 });
