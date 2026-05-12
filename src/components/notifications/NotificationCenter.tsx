import { Bell, Package, ClipboardCheck, X, Check, CheckCheck, Trash2, BellRing, Volume2, VolumeX, Truck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/contexts/NotificationContext";
import { Notification } from "@/types/notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "estoque_baixo":
      return <Package className="h-4 w-4 text-destructive" />;
    case "triagem_pendente":
      return <ClipboardCheck className="h-4 w-4 text-warning" />;
    case "recebimento_chegou":
      return <Truck className="h-4 w-4 text-blue-500" />;
    case "recebimento_divergencia":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "recebimento_conferido":
      return <Check className="h-4 w-4 text-green-500" />;
    case "recebimento":
      return <Package className="h-4 w-4 text-primary" />;
    case "alerta":
      return <Bell className="h-4 w-4 text-warning" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead, removeNotification } = useNotifications();

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer group",
        !notification.read && "bg-accent/30"
      )}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex-shrink-0 mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-medium truncate", !notification.read && "text-foreground")}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          removeNotification(notification.id);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
    pushPermission,
    requestPushPermission,
    soundEnabled,
    setSoundEnabled,
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative touch-friendly">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Desativar som" : "Ativar som"}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar lidas
              </Button>
            )}
          </div>
        </div>

        {pushPermission !== "granted" && (
          <div className="p-3 bg-accent/50 border-b">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <BellRing className="h-4 w-4" />
              <span>Ative notificações push para alertas em tempo real</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={requestPushPermission}
            >
              Ativar Notificações Push
            </Button>
          </div>
        )}

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs text-muted-foreground hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar todas
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
