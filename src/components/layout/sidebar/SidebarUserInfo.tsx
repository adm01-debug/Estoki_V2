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
     <div className="px-3 py-4 border-b border-sidebar-border/20">
       <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/10 border border-sidebar-border/30 shadow-sm">
        <div className="relative">
           <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-sidebar transition-transform hover:scale-105">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
        </div>
        <div className="flex-1 min-w-0">
           <p className="text-sm font-bold text-sidebar-foreground truncate leading-none mb-1.5">{userName}</p>
           <Badge variant="outline" className={cn("text-[10px] h-4.5 px-2 rounded-full font-bold uppercase tracking-wider", getRoleBadgeColor(userRole))}>
            {getRoleLabel(userRole)}
          </Badge>
        </div>
      </div>
    </div>
  );
});
