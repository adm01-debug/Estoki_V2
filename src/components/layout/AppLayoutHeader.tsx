import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Settings, ChevronLeft, LogOut, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield } from "lucide-react";
import { getRoleBadgeColor, getRoleLabel } from "./sidebar";

function getInitials(nome: string) {
  return nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

interface AppLayoutHeaderProps {
  title?: string;
  showBack: boolean;
  rightAction?: ReactNode;
  mainPadding: string;
  userName: string;
  userEmail: string;
  currentRole: string;
  onBack: () => void;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
}

export function AppLayoutHeader({
  title, showBack, rightAction, mainPadding,
  userName, userEmail, currentRole,
  onBack, onLogout, onOpenMobileMenu,
}: AppLayoutHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const shouldShowBack = showBack || !isHome;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />
      <div className={cn("relative flex items-center justify-between h-14 px-4 max-w-[1600px] mx-auto transition-all duration-300", mainPadding)}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onOpenMobileMenu} className="lg:hidden touch-friendly hover:bg-primary/10" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          {shouldShowBack && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onBack} className="touch-friendly hover:bg-primary/10" aria-label="Voltar (Alt+←)">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Voltar <kbd className="ml-1 px-1 py-0.5 rounded bg-muted text-[10px]">Alt+←</kbd>
              </TooltipContent>
            </Tooltip>
          )}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow-sm">
              <Box className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-foreground gradient-text hidden sm:block">ESTOKI</span>
          </div>
          {title && <h1 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h1>}
          <div className="hidden lg:block"><Breadcrumbs /></div>
        </div>
        <div className="flex items-center gap-0.5">
          <GlobalSearch />
          <LanguageSwitcher />
          <NotificationCenter />
          <ThemeToggle />
          {rightAction}
          <div className="ml-1 pl-2 border-l border-border/40">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="touch-friendly relative hover:bg-primary/10 rounded-xl" aria-label="Menu do usuário">
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-1 ring-offset-background">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-bold">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-border/50">
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
          </div>
        </div>
      </div>
    </header>
  );
}
