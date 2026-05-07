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
    <div className="px-4 py-6 border-b border-sidebar-border/10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Avatar className="h-12 w-12 border-2 border-white/5 shadow-xl transition-all duration-500 group-hover:scale-105">
              <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground text-sm font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-[3px] border-sidebar shadow-glow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-sidebar-foreground truncate tracking-tight">{userName}</p>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">{getRoleLabel(userRole)}</p>
          </div>
        </div>
        
        <Badge variant="outline" className={cn(
          "justify-center py-1 font-black text-[9px] uppercase tracking-widest border-white/5 premium-glass",
          getRoleBadgeColor(userRole)
        )}>
          Acesso {getRoleLabel(userRole)}
        </Badge>
      </div>
    </div>
  );
});
