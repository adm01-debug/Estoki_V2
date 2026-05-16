 import { useEffect, useState } from "react";
 import { useLocation } from "react-router-dom";
 import { motion, AnimatePresence } from "framer-motion";
 
 export function GlobalLoadingBar() {
   const location = useLocation();
   const [loading, setLoading] = useState(false);
 
   useEffect(() => {
     setLoading(true);
     const timer = setTimeout(() => setLoading(false), 500);
     return () => clearTimeout(timer);
   }, [location.pathname]);
 
   return (
     <AnimatePresence>
       {loading && (
         <motion.div
           initial={{ width: "0%", opacity: 1 }}
           animate={{ width: "100%" }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
           className="fixed top-0 left-0 h-[3px] bg-primary z-[9999] shadow-[0_0_10px_hsl(var(--primary))]"
         />
       )}
     </AnimatePresence>
   );
 }