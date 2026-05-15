import { memo } from "react";
import { Menu, ChevronLeft, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";

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
  return (
     <header className="sticky top-0 z-50 border-b border-border/30">
       <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" />
       <div className={cn("relative flex items-center justify-between h-16 px-6 max-w-[1600px] mx-auto transition-all duration-300", mainPadding)}>
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
          <GlobalSearch />
          <LanguageSwitcher />
          <NotificationCenter />
          <ThemeToggle />
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
