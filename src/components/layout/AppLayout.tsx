import { ReactNode, useEffect, createContext, useContext, useState, useCallback, memo } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import { useRoutePreload } from "@/hooks/useRoutePreload";
import { prefetchCriticalRoutes } from "@/lib/prefetch";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { useSidebarFavorites } from "@/hooks/useSidebarFavorites";

const AppLayoutContext = createContext(false);
import {
  Box, Settings, ChevronLeft, LogOut, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { OnboardingTour } from "@/components/common/OnboardingTour";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

import {
  SidebarNavButton, SidebarAccordionGroup, SidebarSectionLabel,
  mobileNavItems, fabActions, sidebarMainItems, sidebarGroups,
  sidebarAdminItems, sidebarUtilityItems, getAllNavItems,
  getRoleBadgeColor, getRoleLabel,
} from "./sidebar";

interface AppLayoutProps {
  children?: ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

function getParentRoute(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 1) return "/" + segments.slice(0, -1).join("/");
  return "/";
}

function getInitials(nome: string) {
  return nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function AppLayout({ children, title, showBack = false, rightAction }: AppLayoutProps) {
  const isNested = useContext(AppLayoutContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut, loading } = useAuth();
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const preloadRoute = useRoutePreload();
  const { favorites, toggleFavorite, isFavorite } = useSidebarFavorites();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const isHome = location.pathname === "/";
  const shouldShowBack = showBack || !isHome;
  const parentRoute = getParentRoute(location.pathname);

  const handleBack = useCallback(() => {
    if (window.history.length > 2) navigate(-1);
    else navigate(parentRoute);
  }, [navigate, parentRoute]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft" && !isHome) {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleBack, isHome]);

  useSwipeBack(!isHome);

  useEffect(() => { prefetchCriticalRoutes(); }, []);

  useEffect(() => {
    if (isSupported && permission === "default") requestPermission();
  }, [isSupported, permission, requestPermission]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  if (isNested) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
              <Box className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="absolute -inset-2 rounded-2xl bg-primary/20 animate-ping" />
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const userName = profile?.nome || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';
  const currentRole = role || 'operador';

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigate = (path: string, isMobile = false) => {
    navigate(path);
    if (isMobile) setMobileMenuOpen(false);
  };

  const sidebarWidth = sidebarCollapsed ? "w-[72px]" : "w-[260px]";
  const mainPadding = sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]";

  const renderSidebarContent = (isMobile = false) => {
    const isCollapsed = sidebarCollapsed && !isMobile;
    return (
      <>
        {/* Logo */}
        <div className={cn("p-4 border-b border-sidebar-border/50", isCollapsed && "p-3")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 flex items-center justify-center shadow-glow shrink-0"
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Box className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-extrabold text-sidebar-foreground text-base tracking-tight gradient-text">ESTOKI</h1>
                <p className="text-[10px] text-sidebar-foreground/30 font-medium tracking-wide">ESTOQUE INTELIGENTE</p>
              </div>
            )}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="ml-auto text-sidebar-foreground/50 hover:text-sidebar-foreground">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/30">
              <div className="relative">
                <Avatar className="h-9 w-9 ring-2 ring-primary/30 ring-offset-1 ring-offset-sidebar">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-xs font-bold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{userName}</p>
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 rounded-md", getRoleBadgeColor(currentRole))}>
                  {getRoleLabel(currentRole)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-0.5">
            {favorites.length > 0 && (
              <>
                <SidebarSectionLabel label="Favoritos" collapsed={isCollapsed} />
                {favorites.map((path) => {
                  const item = getAllNavItems().find(i => i.path === path);
                  if (!item) return null;
                  return (
                    <SidebarNavButton key={`fav-${item.path}`} item={item} isActive={location.pathname === item.path}
                      onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />
                  );
                })}
              </>
            )}

            <SidebarSectionLabel label="Principal" collapsed={isCollapsed} />
            {sidebarMainItems.map((item) => (
              <SidebarNavButton key={item.path} item={item} isActive={location.pathname === item.path}
                onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />
            ))}

            <SidebarSectionLabel label="Operações" collapsed={isCollapsed} />
            {sidebarGroups.map((group) => (
              <SidebarAccordionGroup key={group.label} group={group} collapsed={isCollapsed}
                pathname={location.pathname} onNavigate={(path) => handleNavigate(path, isMobile)} onHover={preloadRoute} />
            ))}

            {currentRole === 'admin' && (
              <>
                <SidebarSectionLabel label="Administração" collapsed={isCollapsed} />
                {sidebarAdminItems.map((item) => (
                  <SidebarNavButton key={item.path} item={item} isActive={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />
                ))}
              </>
            )}

            <SidebarSectionLabel label="Conta" collapsed={isCollapsed} />
            {sidebarUtilityItems.map((item) => (
              <SidebarNavButton key={item.path} item={item} isActive={location.pathname === item.path}
                onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border/50 space-y-0.5">
          <SidebarNavButton
            item={{ path: "/configuracoes", icon: Settings, label: "Configurações" }}
            isActive={location.pathname === "/configuracoes"}
            onClick={() => handleNavigate("/configuracoes", isMobile)}
            collapsed={isCollapsed} onHover={preloadRoute}
          />
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all">
                  <LogOut className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={handleLogout} aria-label="Sair da conta" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <AppLayoutContext.Provider value={true}>
    <TooltipProvider>
    <div className="min-h-screen bg-background flex flex-col" role="application" aria-label="ESTOKI WMS">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Pular para conteúdo principal
      </a>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[60%] h-[60%] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.04)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[40%] h-[40%] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.03)_0%,transparent_70%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />
        <div className={cn("relative flex items-center justify-between h-14 px-4 max-w-[1600px] mx-auto transition-all duration-300", mainPadding)}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="lg:hidden touch-friendly hover:bg-primary/10" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
            {shouldShowBack && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleBack} className="touch-friendly hover:bg-primary/10" aria-label="Voltar (Alt+←)">
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
                  <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className={cn("flex-1 overflow-auto transition-all duration-300 relative z-10", mainPadding)} aria-label="Conteúdo principal">
        <div className="max-w-[1600px] mx-auto">
          <div className="lg:hidden"><Breadcrumbs /></div>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FAB Overlay */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)} />
        )}
      </AnimatePresence>

      {/* FAB Quick Actions */}
      <AnimatePresence>
        {fabOpen && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 md:hidden">
            <motion.div className="flex gap-3 p-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              {fabActions.map((action, i) => (
                <motion.button key={action.path} onClick={() => { setFabOpen(false); navigate(action.path); }}
                  className="flex flex-col items-center gap-1.5 w-16 py-2 rounded-xl hover:bg-primary/10 transition-colors"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.9 }}>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      <nav className="sticky bottom-0 border-t border-border/40 px-1 py-1 md:hidden safe-area-bottom relative" aria-label="Navegação mobile">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl" />
        <div className="relative flex items-center justify-around">
          {mobileNavItems.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button key={item.path} data-tour={item.tour} onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }} aria-label={`Ir para ${item.label}`} aria-current={isActive ? "page" : undefined}
                className={cn("flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] px-2 py-1.5 rounded-xl transition-all duration-200 relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                {isActive && <motion.div layoutId="mobile-indicator" className="absolute -top-1 w-8 h-1 bg-primary rounded-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
              </motion.button>
            );
          })}

          {/* FAB Center */}
          <div className="relative -mt-5">
            <motion.button onClick={() => setFabOpen(!fabOpen)} whileTap={{ scale: 0.9 }}
              className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow transition-all duration-300",
                fabOpen ? "bg-destructive rotate-45" : "bg-gradient-to-br from-primary to-primary/80"
              )} aria-label={fabOpen ? "Fechar ações rápidas" : "Ações rápidas"}>
              <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                {fabOpen ? <X className="h-6 w-6 text-destructive-foreground" /> : <Box className="h-6 w-6 text-primary-foreground" />}
              </motion.div>
            </motion.button>
          </div>

          {mobileNavItems.slice(2).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button key={item.path} data-tour={item.tour} onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }} aria-label={`Ir para ${item.label}`} aria-current={isActive ? "page" : undefined}
                className={cn("flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] px-2 py-1.5 rounded-xl transition-all duration-200 relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                {isActive && <motion.div layoutId="mobile-indicator" className="absolute -top-1 w-8 h-1 bg-primary rounded-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className={cn("fixed top-0 left-0 h-full z-40 hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border/50 transition-all duration-300", sidebarWidth)}>
        {renderSidebarContent(false)}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border/50 flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all shadow-sm">
          {sidebarCollapsed ? <ChevronLeft className="h-3 w-3 rotate-180" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)} />
            <motion.aside className="fixed top-0 left-0 h-full w-[280px] bg-sidebar z-50 flex flex-col lg:hidden shadow-2xl"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <OnboardingTour />
    </div>
    </TooltipProvider>
    </AppLayoutContext.Provider>
  );
}

export default AppLayout;
