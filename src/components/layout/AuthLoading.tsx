import { motion } from "framer-motion";
import { Box } from "lucide-react";

export function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div 
        className="flex flex-col items-center gap-4" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
            <Box className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-primary/20 animate-ping" />
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i} 
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}