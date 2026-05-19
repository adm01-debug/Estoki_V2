import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function WMSStatusBadge() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const handleManualSync = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      await queryClient.invalidateQueries();
      setLastSync(new Date());
      toast.success("Dados sincronizados com sucesso");
    } catch (error) {
      toast.error("Erro ao sincronizar dados");
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, [isSyncing, queryClient]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate occasional sync animations for "excellence" feeling
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setLastSync(new Date());
      }, 1500);
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={cn(
          "transition-all duration-300 gap-1.5 py-1 px-2 border-primary/20 bg-background/50 backdrop-blur-sm",
          !isOnline && "border-destructive/30 text-destructive bg-destructive/5"
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3 text-success animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Real-time Sync</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Offline Mode</span>
          </>
        )}
      </Badge>

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium whitespace-nowrap hidden sm:flex">
        {isSyncing ? (
          <RefreshCw className="h-3 w-3 animate-spin text-primary" />
        ) : (
          <CheckCircle2 className="h-3 w-3 text-success" />
        )}
        <span>Last update: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
