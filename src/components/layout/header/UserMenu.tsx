import { memo } from "react";
import { Settings, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRoleBadgeColor, getRoleLabel } from "../sidebar/sidebarNavData";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  currentRole: string;
  onLogout: () => void;
}

export const UserMenu = memo(function UserMenu({
  userName,
  userEmail,
  currentRole,
  onLogout
}: UserMenuProps) {
  const navigate = useNavigate();
  
  const getInitials = (nome: string) => {
    return nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="touch-friendly relative hover:bg-primary/10 rounded-xl" aria-label="Menu do usuário">
          <div className="relative">
             <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-1 ring-offset-background transition-all hover:ring-primary/40">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-bold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
          </div>
        </Button>
      </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="w-64 p-2 bg-popover/95 backdrop-blur-2xl border-border/40 shadow-2xl rounded-2xl animate-in fade-in-0 zoom-in-95">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{userName}</span>
            <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
            <Badge variant="outline" className={cn("w-fit mt-1", getRoleBadgeColor(currentRole))}>
              <Shield className="h-3 w-3 mr-1" />{getRoleLabel(currentRole)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer">
          <Settings className="h-4 w-4 mr-2" />Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
