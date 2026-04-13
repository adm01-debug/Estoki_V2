import { ReactNode, useEffect, createContext, useContext, useState, useCallback, memo } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import { useRoutePreload } from "@/hooks/useRoutePreload";
import { prefetchCriticalRoutes } from "@/lib/prefetch";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { useSidebarFavorites } from "@/hooks/useSidebarFavorites";

const AppLayoutContext = createContext(false);
import { Box, Settings, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingTour } from "@/components/common/OnboardingTour";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

import {
  SidebarNavButton, SidebarAccordionGroup, SidebarSectionLabel,
  mobileNavItems, fabActions, sidebarMainItems, sidebarGroups,
  sidebarAdminItems, sidebarUtilityItems, getAllNavItems,
  getRoleBadgeColor, getRoleLabel,
} from "./sidebar";
import { AppLayoutHeader } from "./AppLayoutHeader";

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
  const parentRoute = getParentRoute(location.pathname);

  const handleBack = useCallback(() => {
    if (window.history.length > 2) navigate(-1);
    else navigate(parentRoute);
  }, [navigate, parentRoute]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft" && !isHome) { e.preventDefault(); handleBack(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleBack, isHome]);

  useSwipeBack(!isHome);
  useEffect(() => { prefetchCriticalRoutes(); }, []);
  useEffect(() => { if (isSupported && permission === "default") requestPermission(); }, [isSupported, permission, requestPermission]);
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

  const handleLogout = async () => { await signOut(); navigate('/auth'); };
  const handleNavigate = (path: string, isMobile = false) => { navigate(path); if (isMobile) setMobileMenuOpen(false); };

  const sidebarWidth = sidebarCollapsed ? "w-[72px]" : "w-[260px]";
  const mainPadding = sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]";

  const renderSidebarContent = (isMobile = false) => {
    const isCollapsed = sidebarCollapsed && !isMobile;
    return (
      <>
        <div className={cn("p-4 border-b border-sidebar-border/50", isCollapsed && "p-3")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <motion.div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 flex items-center justify-center shadow-glow shrink-0" whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }} transition={{ duration: 0.5 }}>
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

        {!isCollapsed && (
          <div className="px-3 py-3 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/30">
              <div className="relative">
                <Avatar className="h-9 w-9 ring-2 ring-primary/30 ring-offset-1 ring-offset-sidebar">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-primary-foreground text-xs font-bold">{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">{userName}</p>
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 rounded-md", getRoleBadgeColor(currentRole))}>{getRoleLabel(currentRole)}</Badge>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-0.5">
            {favorites.length > 0 && (
              <>
                <SidebarSectionLabel label="Favoritos" collapsed={isCollapsed} />
                {favorites.map((path) => {
                  const item = getAllNavItems().find(i => i.path === path);
                  if (!item) return null;
                  return <SidebarNavButton key={`fav-${item.path}`} item={item} isActive={location.pathname === item.path} onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />;
                })}
              </>
            )}
            <SidebarSectionLabel label="Principal" collapsed={isCollapsed} />
            {sidebarMainItems.map((item) => <SidebarNavButton key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />)}
            <SidebarSectionLabel label="Operações" collapsed={isCollapsed} />
            {sidebarGroups.map((group) => <SidebarAccordionGroup key={group.label} group={group} collapsed={isCollapsed} pathname={location.pathname} onNavigate={(path) => handleNavigate(path, isMobile)} onHover={preloadRoute} />)}
            {currentRole === 'admin' && (
              <>
                <SidebarSectionLabel label="Administração" collapsed={isCollapsed} />
                {sidebarAdminItems.map((item) => <SidebarNavButton key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />)}
              </>
            )}
            <SidebarSectionLabel label="Conta" collapsed={isCollapsed} />
            {sidebarUtilityItems.map((item) => <SidebarNavButton key={item.path} item={item} isActive={location.pathname === item.path} onClick={() => handleNavigate(item.path, isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />)}
          </nav>
        </ScrollArea>

        <div className="p-2 border-t border-sidebar-border/50 space-y-0.5">
          <SidebarNavButton item={{ path: "/configuracoes", icon: Settings, label: "Configurações" }} isActive={location.pathname === "/configuracoes"} onClick={() => handleNavigate("/configuracoes", isMobile)} collapsed={isCollapsed} onHover={preloadRoute} />
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"><LogOut className="h-[18px] w-[18px]" /></button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={handleLogout} aria-label="Sair da conta" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /><span className="text-sm font-medium">Sair</span>
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
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[60%] h-[60%] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.04)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[40%] h-[40%] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.03)_0%,transparent_70%)]" />
      </div>

      <AppLayoutHeader
        title={title} showBack={showBack} rightAction={rightAction} mainPadding={mainPadding}
        userName={userName} userEmail={userEmail} currentRole={currentRole}
        onBack={handleBack} onLogout={handleLogout} onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

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

      <AnimatePresence>
        {fabOpen && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFabOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fabOpen && (
          <div className="fixed bottom-24 right-6 z-50 flex flex-col-reverse gap-3 md:hidden">
            {fabActions.map((action, index) => (
              <motion.div key={action.path} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} transition={{ delay: index * 0.05 }}>
                <Button variant="secondary" className="shadow-lg gap-2 rounded-xl" onClick={() => { navigate(action.path); setFabOpen(false); }}>
                  <action.icon className="h-4 w-4" />{action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <motion.button
          className={cn("w-14 h-14 rounded-2xl shadow-glow flex items-center justify-center", fabOpen ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground")}
          whileTap={{ scale: 0.9 }} onClick={() => setFabOpen(!fabOpen)}
          aria-label={fabOpen ? "Fechar menu rápido" : "Abrir menu rápido"}
        >
          <motion.div animate={{ rotate: fabOpen ? 45 : 0 }}><Box className="h-6 w-6" /></motion.div>
        </motion.button>
      </div>

      <aside className={cn("fixed top-0 left-0 h-full z-40 hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border/50 transition-all duration-300", sidebarWidth)}>
        {renderSidebarContent(false)}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center hover:bg-sidebar-accent transition-colors"
          aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <Box className="h-3 w-3 text-sidebar-foreground/50" />
          </motion.div>
        </button>
      </aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} />
            <motion.aside className="fixed top-0 left-0 h-full w-[280px] bg-sidebar z-50 flex flex-col lg:hidden" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden" role="navigation" aria-label="Menu principal">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl border-t border-border/40" />
        <div className="relative flex items-center justify-around h-16 px-2 safe-area-bottom">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button key={item.path} onClick={() => navigate(item.path)}
                className={cn("flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all touch-friendly min-w-[60px]", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => preloadRoute(item.path)}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                <div className={cn("p-1.5 rounded-xl transition-all", isActive && "bg-primary/10")}>
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <motion.div className="w-1 h-1 rounded-full bg-primary" layoutId="mobile-indicator" />}
              </motion.button>
            );
          })}
        </div>
      </nav>

      <OnboardingTour />
    </div>
    </TooltipProvider>
    </AppLayoutContext.Provider>
  );
}
