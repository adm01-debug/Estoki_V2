import { ReactNode, createContext, useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { OnboardingTour } from "@/components/common/OnboardingTour";
import { useAuth } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeBack } from "@/hooks/useSwipeBack";

import { useAppLayoutState } from "@/hooks/useAppLayoutState";
import { AuthLoading } from "./AuthLoading";
import { Header } from "./header/Header";
import { SidebarContent } from "./SidebarContent";
import { MobileNavigation } from "./MobileNavigation";

const AppLayoutContext = createContext(false);

interface AppLayoutProps {
  children?: ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export function AppLayout({ children, title, showBack = false, rightAction }: AppLayoutProps) {
  const isNested = useContext(AppLayoutContext);
  const { user, profile, role, loading } = useAuth();
  
  const {
    location,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    fabOpen,
    setFabOpen,
    isHome,
    handleBack,
    handleLogout,
    handleNavigate
  } = useAppLayoutState();

  const shouldShowBack = showBack || !isHome;
  useSwipeBack(!isHome);

  if (isNested) return <>{children}</>;
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/auth" replace />;

  const userName = profile?.nome || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';
  const currentRole = role || 'operador';

  const sidebarWidth = sidebarCollapsed ? "w-[72px]" : "w-[260px]";
  const mainPadding = sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]";

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

          <Header 
            mainPadding={mainPadding}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            shouldShowBack={shouldShowBack}
            onBack={handleBack}
            title={title}
            rightAction={rightAction}
            userName={userName}
            userEmail={userEmail}
            currentRole={currentRole}
            onLogout={handleLogout}
          />

          <main id="main-content" className={cn("flex-1 overflow-auto transition-all duration-300 relative z-10", mainPadding)} aria-label="Conteúdo principal">
            <div className="max-w-[1600px] mx-auto">
              <div className="lg:hidden">
                <Breadcrumbs />
              </div>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={location.pathname} 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -4 }} 
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {children || <Outlet />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          <MobileNavigation 
            fabOpen={fabOpen}
            setFabOpen={setFabOpen}
            pathname={location.pathname}
            onNavigate={handleNavigate}
          />

          <aside className={cn("fixed top-0 left-0 h-full z-40 hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border/50 transition-all duration-300", sidebarWidth)}>
            <SidebarContent 
              sidebarCollapsed={sidebarCollapsed}
              userName={userName}
              userRole={currentRole}
              pathname={location.pathname}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              aria-label={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
              className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border/50 flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all shadow-sm"
            >
              {sidebarCollapsed ? <ChevronLeft className="h-3 w-3 rotate-180" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          </aside>

          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)} 
                />
                <motion.aside 
                  className="fixed top-0 left-0 h-full w-[280px] bg-sidebar z-50 flex flex-col lg:hidden shadow-2xl"
                  initial={{ x: "-100%" }} 
                  animate={{ x: 0 }} 
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <SidebarContent 
                    isMobile={true}
                    sidebarCollapsed={sidebarCollapsed}
                    userName={userName}
                    userRole={currentRole}
                    pathname={location.pathname}
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                    onCloseMobile={() => setMobileMenuOpen(false)}
                  />
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
