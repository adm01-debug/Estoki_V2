import {
  Bell,
  Package,
  ClipboardCheck,
  X,
  Check,
  CheckCheck,
  Trash2,
  BellRing,
  Volume2,
  VolumeX,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
        "group flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-accent/50",
        !notification.read && "bg-accent/30"
      )}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="mt-0.5 flex-shrink-0">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn("truncate text-sm font-medium", !notification.read && "text-foreground")}
          >
            {notification.title}
          </p>
          {!notification.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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
        <Button variant="ghost" size="icon" className="touch-friendly relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center px-1 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 overflow-hidden rounded-2xl border-border/40 bg-popover/95 p-0 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95"
        align="end"
      >
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="text-sm font-semibold">Notificações</h4>
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
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                <CheckCheck className="mr-1 h-3 w-3" />
                Marcar lidas
              </Button>
            )}
          </div>
        </div>

        {pushPermission !== "granted" && (
          <div className="border-b bg-accent/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <BellRing className="h-4 w-4" />
              <span>Ative notificações push para alertas em tempo real</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={requestPushPermission}
            >
              Ativar Notificações Push
            </Button>
          </div>
        )}

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
              <Bell className="mb-2 h-10 w-10 opacity-50" />
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
                className="h-8 w-full text-xs text-muted-foreground hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Limpar todas
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
