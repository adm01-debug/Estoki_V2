 import { memo } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Menu, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserMenu } from "@/components/layout/header/UserMenu";
import { BackButton } from "@/components/molecules/navigation/BackButton";
import { cn } from "@/lib/utils";
import { WMSStatusBadge } from "@/components/common/WMSStatusBadge";
import { PresenceAvatars } from "@/components/common/PresenceAvatars";

interface HeaderProps {
  mainPadding: string;
  onOpenMobileMenu: () => void;
  shouldShowBack: boolean;
  title?: string;
  rightAction?: React.ReactNode;
  userName: string;
  userEmail: string;
  currentRole: string;
  onLogout: () => void;
  isHome?: boolean;
  avatarUrl?: string | null;
}

/**
 * Header Organism
 * Centralizes top navigation and global actions.
 */
export const Header = memo(function Header({
  mainPadding,
  onOpenMobileMenu,
  shouldShowBack,
  title,
  rightAction,
  userName,
  userEmail,
  currentRole,
  onLogout,
  isHome,
  avatarUrl
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 border-b border-border/10">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
      <div className={cn("relative flex items-center justify-between h-16 px-4 lg:px-6 max-w-[1600px] mx-auto transition-all duration-500 ease-in-out", mainPadding)}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onOpenMobileMenu} className="lg:hidden touch-friendly hover:bg-primary/10" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
          
           <AnimatePresence mode="wait">
             {shouldShowBack && (
               <motion.div
                 initial={{ opacity: 0, x: -10, width: 0 }}
                 animate={{ opacity: 1, x: 0, width: "auto" }}
                 exit={{ opacity: 0, x: -10, width: 0 }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 className="flex items-center"
               >
                 <BackButton />
               </motion.div>
             )}
           </AnimatePresence>

          {isHome && (
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow-sm">
                <Box className="h-4 w-4 text-primary-foreground" />
              </div>
               <span className="font-extrabold text-foreground gradient-text hidden sm:block uppercase">Promo Brindes</span>
            </div>
          )}
          {title && <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block">{title}</h1>}
        </div>
        
        <div className="flex items-center gap-0.5">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <PresenceAvatars />
            <div className="hidden md:block w-px h-4 bg-border/40 mx-1" />
            <div className="hidden md:block">
              <WMSStatusBadge />
            </div>
          </div>
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
              avatarUrl={avatarUrl}
              onLogout={onLogout} 
            />
          </div>
        </div>
      </div>
    </header>
  );
});