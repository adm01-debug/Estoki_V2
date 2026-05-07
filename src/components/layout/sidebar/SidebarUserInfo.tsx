import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRoleBadgeColor, getRoleLabel } from "./sidebarNavData";

interface SidebarUserInfoProps {
  userName: string;
  userRole: string;
  initials: string;
}

export const SidebarUserInfo = memo(function SidebarUserInfo({ 
  userName, 
  userRole, 
  initials 
}: SidebarUserInfoProps) {
  return (
    <div className="px-3 py-3 border-b border-sidebar-border/50">
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/30">
        <div className="relative">
          <Avatar className="h-9 w-9 ring-2 ring-primary/30 ring-offset-1 ring-offset-sidebar">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-sidebar-foreground truncate">{userName}</p>
          <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 rounded-md", getRoleBadgeColor(userRole))}>
            {getRoleLabel(userRole)}
          </Badge>
        </div>
      </div>
    </div>
  );
});
