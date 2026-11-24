import { motion } from "framer-motion";
import { Activity, ShieldCheck, Database, Wifi, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME } from "@/constants/app";
import { cn } from "@/lib/utils";

export function SystemHealthMonitor() {
  const {
    data: snapshots,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["db-health-snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("db_health_snapshots")
        .select("wal_bytes, xact_commit, xact_rollback, deadlocks, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const last = snapshots?.[0];
  const integrates = snapshots?.length ?? 0;
  const integradas = snapshots?.reduce((acc, s) => acc + (Number(s.xact_commit) || 0), 0) || 0;
  const falhas = snapshots?.reduce((acc, s) => acc + (Number(s.xact_rollback) || 0), 0) || 0;
  const integridade =
    integrates > 0
      ? Math.min(Math.round((integradas / Math.max(integradas + falhas, 1)) * 100), 100)
      : 0;
  const linkOk = !isLoading && !isError && snapshots !== undefined;

  const stats = [
    {
      label: "Status",
      value: isError ? "Indisponível" : linkOk ? "Operacional" : "Verificando...",
      icon: ShieldCheck,
      color: isError ? "text-destructive" : "text-success",
    },
    {
      label: "Operações",
      value: last ? `${Number(last.xact_commit) || 0} commits` : "-",
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Sync",
      value: isError ? "-" : integrates ? "Ativo" : "Sem histórico",
      icon: Wifi,
      color: "text-blue-500",
    },
    { label: "Integridade", value: `${integridade}%`, icon: Database, color: "text-indigo-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={cn(
              "h-3 w-3 rounded-full",
              isError ? "bg-destructive" : "animate-pulse bg-success"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 h-3 w-3 rounded-full",
              isError ? "bg-destructive/20" : "animate-ping bg-success/50"
            )}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase leading-none tracking-widest text-muted-foreground">
            Status do Sistema
          </span>
          <span className="text-sm font-black uppercase tracking-tight text-foreground">
            {APP_NAME} <span className="text-primary">WMS</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase leading-none tracking-tighter text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-xs font-black tracking-tight">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden items-center gap-2 text-muted-foreground xl:flex">
        <Clock className="h-3 w-3" />
        <span className="text-[10px] font-medium tracking-tight">
          Última sincronização:{" "}
          {last?.created_at
            ? new Date(last.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "-"}
        </span>
      </div>
    </motion.div>
  );
}
