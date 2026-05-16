import { memo } from "react";
import { Menu, ChevronLeft, Box, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface HeaderProps {
  mainPadding: string;
  onOpenMobileMenu: () => void;
  shouldShowBack: boolean;
  onBack: () => void;
  title?: string;
  rightAction?: React.ReactNode;
  userName: string;
  userEmail: string;
  currentRole: string;
  onLogout: () => void;
  isHome?: boolean;
}

 export const Header = memo(function Header({
  mainPadding,
  onOpenMobileMenu,
  shouldShowBack,
  onBack,
  title,
  rightAction,
  userName,
  userEmail,
  currentRole,
  onLogout,
  isHome
}: HeaderProps) {
  const isOnline = useOnlineStatus();

  return (
     <header className="sticky top-0 z-50 border-b border-border/30">
       <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" />
       <div className={cn("relative flex items-center justify-between h-16 px-6 max-w-[1600px] mx-auto transition-all duration-300", mainPadding)}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onOpenMobileMenu} className="lg:hidden touch-friendly hover:bg-primary/10" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
            <div className={cn("flex items-center transition-all duration-300", shouldShowBack ? "w-11 opacity-100" : "w-0 opacity-0 overflow-hidden")}>
              {shouldShowBack && (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={onBack} 
                      className="touch-friendly hover:bg-primary/10 active:scale-90 transition-transform bg-background/50 border border-border/20 shadow-sm" 
                      aria-label="Voltar para tela anterior (Atalho: Alt + Seta Esquerda)"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-wider bg-popover/95 backdrop-blur-md border-border/40">
                    Voltar <kbd className="ml-2 px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Alt+←</kbd>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          {isHome && (
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow-sm">
                <Box className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-foreground gradient-text hidden sm:block">ESTOKI</span>
            </div>
          )}
           {title && <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block">{title}</h1>}
        </div>
        <div className="flex items-center gap-0.5">
          {!isOnline && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-destructive/10 text-destructive rounded-full border border-destructive/20 mr-2 animate-pulse">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">Offline</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Você está operando em modo offline. Algumas funções podem estar limitadas.
              </TooltipContent>
            </Tooltip>
          )}
          <GlobalSearch />
          <LanguageSwitcher />
           <div role="group" aria-label="Ações rápidas" className="flex items-center gap-0.5">
             <NotificationCenter />
             <ThemeToggle />
           </div>
          {rightAction}
          <div className="ml-1 pl-2 border-l border-border/40">
            <UserMenu 
              userName={userName} 
              userEmail={userEmail} 
              currentRole={currentRole} 
              onLogout={onLogout} 
            />
          </div>
        </div>
      </div>
    </header>
  );
});
