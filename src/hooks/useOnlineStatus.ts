import { useState, useEffect } from "react";

/**
 * Hook para monitorar status de conexão
 * Útil para PWA e funcionalidades offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Componente para mostrar indicador de conexão
 */
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

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
