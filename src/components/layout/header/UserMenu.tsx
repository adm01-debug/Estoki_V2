import { memo } from "react";
import { Settings, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getRoleBadgeColor, getRoleLabel } from "../sidebar/sidebarNavData";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  currentRole: string;
  avatarUrl?: string | null;
  onLogout: () => void;
}

export const UserMenu = memo(function UserMenu({
  userName,
  userEmail,
  currentRole,
  avatarUrl,
  onLogout,
}: UserMenuProps) {
  const navigate = useNavigate();

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="touch-friendly relative rounded-xl hover:bg-primary/10"
          aria-label="Menu do usuário"
        >
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-1 ring-offset-background transition-all hover:ring-primary/40">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-xs font-bold text-primary-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border-border/40 bg-popover/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{userName}</span>
            <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
            <Badge variant="outline" className={cn("mt-1 w-fit", getRoleBadgeColor(currentRole))}>
              <Shield className="mr-1 h-3 w-3" />
              {getRoleLabel(currentRole)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/configuracoes")}
          className="h-10 cursor-pointer rounded-xl"
        >
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="h-10 cursor-pointer rounded-xl text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
