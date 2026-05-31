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
  isHome,
}: HeaderProps) {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-50 border-b border-border/10">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
      <div
        className={cn(
          "relative mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 transition-all duration-500 ease-in-out lg:px-6",
          mainPadding
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="touch-friendly hover:bg-primary/10 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div
            className={cn(
              "flex items-center transition-all duration-300",
              shouldShowBack ? "w-11 opacity-100" : "w-0 overflow-hidden opacity-0"
            )}
          >
            {shouldShowBack && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="touch-friendly border border-border/20 bg-background/50 shadow-sm transition-transform hover:bg-primary/10 active:scale-90"
                    aria-label="Voltar para tela anterior (Atalho: Alt + Seta Esquerda)"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="border-border/40 bg-popover/95 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                >
                  Voltar{" "}
                  <kbd className="ml-2 rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                    Alt+←
                  </kbd>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {isHome && (
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-glow-sm">
                <Box className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="gradient-text hidden font-extrabold text-foreground sm:block">
                ESTOKI
              </span>
            </div>
          )}
          {title && (
            <h1 className="hidden text-xl font-bold tracking-tight text-foreground sm:block">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {!isOnline && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="mr-2 flex animate-pulse items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-destructive">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span className="hidden text-[10px] font-black uppercase tracking-wider md:inline">
                    Offline
                  </span>
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
          <div className="ml-1 border-l border-border/40 pl-2">
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
