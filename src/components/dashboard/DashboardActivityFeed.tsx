import { motion } from "framer-motion";
import { useAuditLog } from "@/hooks/useAuditLog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Package,
  User,
  ShoppingCart,
  Truck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AuditLogEntry } from "@/services/auditService";

export const DashboardActivityFeed = () => {
  const { logs, isLoading } = useAuditLog({ pageSize: 5 });
  const recentLogs = Array.isArray(logs) ? logs.slice(0, 5) : [];

  const getIcon = (action: string, type: string) => {
    if (type === "produto") return <Package className="h-4 w-4 text-blue-500" />;
    if (type === "pedido") return <ShoppingCart className="h-4 w-4 text-purple-500" />;
    if (type === "expedicao") return <Truck className="h-4 w-4 text-orange-500" />;
    if (action === "login") return <User className="h-4 w-4 text-green-500" />;
    if (action === "delete") return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recentLogs.map((log: AuditLogEntry, index: number) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative flex items-start gap-4 rounded-2xl border border-transparent p-3 transition-all hover:border-border/50 hover:bg-muted/40"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background shadow-sm transition-transform group-hover:scale-110">
            {getIcon(log.action, log.entity_type)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold uppercase tracking-tight text-foreground">
                {log.user_nome || "Sistema"}
              </p>
              <span className="whitespace-nowrap rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>

            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              <span
                className={cn(
                  "mr-1 font-black",
                  log.action === "create"
                    ? "text-success"
                    : log.action === "delete"
                      ? "text-destructive"
                      : "text-primary"
                )}
              >
                {log.action.toUpperCase()}
              </span>
              {log.entity_label || `${log.entity_type} #${log.entity_id?.slice(0, 8)}`}
            </p>
          </div>

          {log.action === "create" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
          )}
        </motion.div>
      ))}

      {(!Array.isArray(logs) || logs.length === 0) && (
        <div className="py-12 text-center">
          <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs font-medium text-muted-foreground">
            Nenhuma atividade recente registrada.
          </p>
        </div>
      )}
    </div>
  );
};
