import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Componente para mostrar indicador de conexão
 */
export function OnlineIndicator({ className }: { className?: string }) {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs",
        isOnline ? "text-green-500" : "text-red-500",
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
