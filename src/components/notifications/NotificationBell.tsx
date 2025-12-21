import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Notification { id: string; title: string; message: string; read: boolean; createdAt: string; }

interface NotificationBellProps { notifications: Notification[]; onMarkRead: (id: string) => void; onMarkAllRead: () => void; }

export function NotificationBell({ notifications, onMarkRead, onMarkAllRead }: NotificationBellProps) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unread > 0 && <button onClick={onMarkAllRead} className="text-xs text-primary">Marcar todas lidas</button>}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground text-sm">Nenhuma notificação</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} onClick={() => onMarkRead(n.id)} className={cn("p-3 border-b cursor-pointer hover:bg-muted/50", !n.read && "bg-primary/5")}>
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
