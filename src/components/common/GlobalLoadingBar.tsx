import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalLoadingBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ width: "0%", opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "circIn" }}
          className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 z-[9999] shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
