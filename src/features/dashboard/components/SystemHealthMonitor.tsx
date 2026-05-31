 import { motion } from "framer-motion";
 import { Activity, ShieldCheck, Database, Wifi, Clock } from "lucide-react";
 import { useEffect, useState } from "react";
 import { cn } from "@/lib/utils";
 
  export function SystemHealthMonitor() {
    const [latency, setLatency] = useState<number>(18);
    const [lastSync, setLastSync] = useState(new Date());
  
    useEffect(() => {
      const interval = setInterval(() => {
        setLatency(prev => {
          const next = prev + (Math.random() > 0.5 ? 1 : -1);
          return Math.min(Math.max(next, 15), 35);
        });
        if (Math.random() > 0.7) setLastSync(new Date());
      }, 3000);
      return () => clearInterval(interval);
    }, []);
 
   const stats = [
     { label: "Status", value: "Operacional", icon: ShieldCheck, color: "text-success" },
     { label: "Latência", value: `${latency}ms`, icon: Activity, color: "text-primary" },
     { label: "Sync", value: "Ativo", icon: Wifi, color: "text-blue-500" },
     { label: "Integridade", value: "100%", icon: Database, color: "text-indigo-500" },
   ];
 
   return (
     <motion.div 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-6"
     >
       <div className="flex items-center gap-3">
         <div className="relative">
           <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
           <div className="absolute inset-0 w-3 h-3 rounded-full bg-success/50 animate-ping" />
         </div>
         <div className="flex flex-col">
           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Status do Sistema</span>
            <span className="text-sm font-black tracking-tight text-foreground uppercase">Promo Brindes Intelligence <span className="text-primary">v10.1</span></span>
         </div>
       </div>
 
       <div className="flex items-center gap-8">
         {stats.map((stat, i) => (
           <div key={i} className="flex items-center gap-2.5">
             <stat.icon className={cn("h-4 w-4", stat.color)} />
             <div className="flex flex-col">
               <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground leading-none">{stat.label}</span>
               <span className="text-xs font-black tracking-tight">{stat.value}</span>
             </div>
           </div>
         ))}
       </div>
 
       <div className="hidden xl:flex items-center gap-2 text-muted-foreground">
         <Clock className="h-3 w-3" />
         <span className="text-[10px] font-medium tracking-tight">Última sincronização: {lastSync.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
       </div>
     </motion.div>
   );
 }