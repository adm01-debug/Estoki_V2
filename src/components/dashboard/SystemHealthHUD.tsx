import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Database, Server, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const SystemHealthHUD = () => {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<'optimal' | 'degraded' | 'critical'>('optimal');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkLatency = async () => {
      const start = performance.now();
      try {
        await supabase.from('posicao_palete').select('count', { count: 'exact', head: true }).limit(1);
        const end = performance.now();
        const duration = Math.round(end - start);
        setLatency(duration);
        
        if (duration < 250) setStatus('optimal');
        else if (duration < 600) setStatus('degraded');
        else setStatus('critical');
      } catch (e) {
        setStatus('critical');
      }
    };

    checkLatency();
    const interval = setInterval(checkLatency, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 right-6 z-40 hidden md:block">
      <motion.div 
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-xl transition-all shadow-lg",
          status === 'optimal' ? "bg-green-500/5 border-green-500/20 text-green-600" :
          status === 'degraded' ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-600" :
          "bg-red-500/5 border-red-500/20 text-red-600"
        )}
      >
        <div className="relative">
          <Activity className={cn("h-4 w-4", status === 'optimal' && "animate-pulse")} />
          <div className={cn(
            "absolute -top-1 -right-1 w-2 h-2 rounded-full",
            status === 'optimal' ? "bg-green-500" :
            status === 'degraded' ? "bg-yellow-500" : "bg-red-500"
          )} />
        </div>
        
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          {isExpanded ? "System Health Monitor" : `${latency ?? '--'}ms`}
        </span>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-4 pl-4 border-l border-current/10 ml-1"
            >
              <HealthItem icon={<Database className="h-3 w-3" />} label="Cloud" value="Online" />
              <HealthItem icon={<Server className="h-3 w-3" />} label="Edge" value="Active" />
              <HealthItem icon={<Shield className="h-3 w-3" />} label="Auth" value="Secure" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const HealthItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1 opacity-60">
      {icon}
      <span className="text-[8px] font-bold uppercase">{label}</span>
    </div>
    <span className="text-[9px] font-black">{value}</span>
  </div>
);
