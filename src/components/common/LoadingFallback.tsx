import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingFallback = forwardRef<HTMLDivElement>(function LoadingFallback(_props, ref) {
  return (
    <div
      ref={ref}
      className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-border/10 bg-background/50 p-12 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
          <Loader2 className="relative z-10 mx-auto h-16 w-16 animate-spin text-primary" />
        </div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-xl font-bold text-foreground"
        >
          Sincronizando Dados
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4 }}
          className="mx-auto max-w-[200px] text-sm leading-relaxed text-muted-foreground"
        >
          Preparando ambiente seguro e eficiente...
        </motion.p>
      </motion.div>
    </div>
  );
});
