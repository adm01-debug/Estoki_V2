import { ReactNode, useEffect, createContext, useContext, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";

const AppLayoutContext = createContext(false);
import { 
  LayoutDashboard, 
  Package, 
  Search, 
  Warehouse, 
  QrCode, 
  ArrowLeftRight,
  Truck,
  Undo2,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LogOut,
  Shield,
  Users,
  ClipboardList,
  Layers,
  ListTodo,
  BellRing,
  Activity,
  Route,
  Building2,
  FileText,
  AlertTriangle,
  UserCircle,
  HelpCircle,
  Bell,
  FolderTree,
  Scan,
  Sparkles,
  type LucideIcon
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AppLayoutProps {
  children?: ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  tour?: string;
}

// Bottom nav (mobile) - most used
const mobileNavItems: NavItem[] = [
  { path: "/", icon: LayoutDashboard, label: "Início", tour: "inicio" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard", tour: "dashboard" },
  { path: "/recebimento", icon: Package, label: "Receber", tour: "recebimento" },
  { path: "/triagem", icon: Search, label: "Triagem", tour: "triagem" },
  { path: "/estoque", icon: Warehouse, label: "Estoque", tour: "estoque" },
];

// Main sidebar sections
const sidebarMainItems: NavItem[] = [
  { path: "/", icon: LayoutDashboard, label: "Início", tour: "inicio" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard", tour: "dashboard" },
  { path: "/monitor", icon: Activity, label: "Monitor Live", tour: "monitor" },
  { path: "/recebimento", icon: Package, label: "Receber", tour: "recebimento" },
  { path: "/triagem", icon: Search, label: "Triagem", tour: "triagem" },
  { path: "/estoque", icon: Warehouse, label: "Estoque", tour: "estoque" },
  { path: "/governanca", icon: Shield, label: "Governança", tour: "governanca" },
  { path: "/scanner", icon: QrCode, label: "Scanner", tour: "scanner" },
  { path: "/romaneios", icon: Truck, label: "Romaneios", tour: "romaneios" },
];

const sidebarSecondaryItems: NavItem[] = [
  { path: "/produtos", icon: Package, label: "Produtos" },
  { path: "/lotes", icon: Layers, label: "Lotes" },
  { path: "/posicoes", icon: Warehouse, label: "Posições" },
  { path: "/categorias", icon: FolderTree, label: "Categorias" },
  { path: "/movimentacao", icon: ArrowLeftRight, label: "Movimentação" },
  { path: "/armazenamento", icon: Building2, label: "Armazenamento" },
  { path: "/picking", icon: ListTodo, label: "Picking" },
  { path: "/putaway", icon: Package, label: "Putaway" },
  { path: "/ondas", icon: Route, label: "Ondas" },
  { path: "/qualidade", icon: ClipboardList, label: "Qualidade" },
  { path: "/conferencia", icon: Scan, label: "Conferência" },
  { path: "/expedicao", icon: Truck, label: "Expedição" },
  { path: "/inventario", icon: ClipboardList, label: "Inventário Cíclico" },
  { path: "/curva-abc", icon: Layers, label: "Curva ABC" },
  { path: "/tarefas", icon: ListTodo, label: "Gestão Tarefas" },
  { path: "/alertas", icon: BellRing, label: "Alertas" },
  { path: "/kpis-operacionais", icon: Activity, label: "KPIs" },
  { path: "/produtividade", icon: Users, label: "Produtividade" },
  { path: "/gamificacao", icon: Activity, label: "Gamificação" },
  { path: "/rastreabilidade", icon: Route, label: "Rastreabilidade" },
  { path: "/seriais", icon: QrCode, label: "Seriais" },
  { path: "/pedidos", icon: FileText, label: "Pedidos" },
  { path: "/clientes", icon: Users, label: "Clientes" },
  { path: "/armazens", icon: Building2, label: "Armazéns" },
  { path: "/fornecedores", icon: Building2, label: "Qualidade Fornec." },
  { path: "/trocas", icon: Undo2, label: "Trocas/Devoluções" },
  { path: "/trocas-dashboard", icon: BarChart3, label: "Dashboard Trocas" },
  { path: "/divergencias", icon: AlertTriangle, label: "Divergências" },
  { path: "/relatorios", icon: FileText, label: "Relatórios" },
  { path: "/seguranca", icon: Shield, label: "Segurança" },
  { path: "/ocupacao", icon: Warehouse, label: "Ocupação Visual" },
];

const sidebarAdminItems: NavItem[] = [
  { path: "/admin/usuarios", icon: Users, label: "Usuários" },
  { path: "/admin/roles", icon: Shield, label: "Papéis" },
  { path: "/admin/configuracoes", icon: Settings, label: "Config Admin" },
  { path: "/admin/auditoria", icon: ClipboardList, label: "Auditoria" },
  { path: "/admin/integracoes", icon: Activity, label: "Integrações" },
];

const sidebarUtilityItems: NavItem[] = [
  { path: "/perfil", icon: UserCircle, label: "Meu Perfil" },
  { path: "/notificacoes", icon: Bell, label: "Notificações" },
  { path: "/ajuda", icon: HelpCircle, label: "Ajuda" },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-primary/20 text-primary border-primary/30";
    case "supervisor": return "bg-info/20 text-info border-info/30";
    default: return "bg-success/20 text-success border-success/30";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin": return "Administrador";
    case "supervisor": return "Supervisor";
    default: return "Operador";
  }
};

function SidebarNavButton({ item, isActive, onClick, collapsed }: { item: NavItem; isActive: boolean; onClick: () => void; collapsed: boolean }) {
  const button = (
    <button
      data-tour={item.tour}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg transition-all duration-200 group relative",
        collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5",
        isActive 
          ? "bg-primary/10 text-primary sidebar-active-glow" 
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <item.icon className={cn(
        "h-[18px] w-[18px] shrink-0 transition-colors",
        isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
      )} />
      {!collapsed && (
        <span className={cn(
          "text-sm transition-colors",
          isActive ? "font-semibold" : "font-medium"
        )}>{item.label}</span>
      )}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function SidebarSectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-3 mx-3 border-t border-sidebar-border" />;
  return (
    <p className="px-3 text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-[0.15em] mb-1.5 mt-5">
      {label}
    </p>
  );
}

export function AppLayout({ children, title, showBack = false, rightAction }: AppLayoutProps) {
  const isNested = useContext(AppLayoutContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut, loading } = useAuth();
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isSupported && permission === "default") {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  if (isNested) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
            <Warehouse className="h-6 w-6 text-primary" />
          </div>
          <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userName = profile?.nome || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';
  const currentRole = role || 'operador';

  const getInitials = (nome: string) => {
    return nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const sidebarWidth = sidebarCollapsed ? "w-[68px]" : "w-64";
  const mainPadding = sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-64";

  return (
    <AppLayoutContext.Provider value={true}>
    <TooltipProvider>
    <div className="min-h-screen bg-background flex flex-col ambient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-2.5">
        <div className={cn("flex items-center justify-between max-w-[1600px] mx-auto transition-all", mainPadding)}>
          <div className="flex items-center gap-3">
            {showBack ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="touch-friendly hover:bg-primary/10"
                aria-label="Voltar para página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 lg:hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Warehouse className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground hidden sm:block">
                  ESTOKI
                </span>
              </div>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-1">
            <GlobalSearch />
            <LanguageSwitcher />
            <NotificationCenter />
            <ThemeToggle />
            {rightAction}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="touch-friendly relative hover:bg-primary/10" aria-label="Menu do usuário">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-xl border-border/50">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{userName}</span>
                    <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                    <Badge variant="outline" className={cn("w-fit mt-1", getRoleBadgeColor(currentRole))}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleLabel(currentRole)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1 overflow-auto transition-all duration-300", mainPadding)}>
        <div className="max-w-[1600px] mx-auto relative z-10">
          <Breadcrumbs />
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="sticky bottom-0 bg-card/90 backdrop-blur-xl border-t border-border/50 px-1 py-1 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                data-tour={item.tour}
                onClick={() => navigate(item.path)}
                aria-label={`Ir para ${item.label}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] px-2 py-1.5 rounded-xl transition-all duration-200 active:scale-95",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground active:bg-muted"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} aria-hidden="true" />
                <span className={cn("text-[10px] font-medium leading-tight", isActive && "font-bold text-primary")}>{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0.5 w-5 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col z-40 transition-all duration-300",
        sidebarWidth
      )}>
        {/* Logo */}
        <div className="p-3 border-b border-sidebar-border">
          <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-3 px-1")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Warehouse className="h-5 w-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sidebar-foreground text-sm tracking-tight">ESTOKI</h1>
                <p className="text-[10px] text-sidebar-foreground/40 font-medium">Promo Brindes WMS</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2.5 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-sidebar-accent/50">
              <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-[10px] font-bold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {userName}
                </p>
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1", getRoleBadgeColor(currentRole))}>
                  {getRoleLabel(currentRole)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-0.5">
            {sidebarMainItems.map((item) => (
              <SidebarNavButton
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                collapsed={sidebarCollapsed}
              />
            ))}
            
            <SidebarSectionLabel label="Operações" collapsed={sidebarCollapsed} />
            {sidebarSecondaryItems.map((item) => (
              <SidebarNavButton
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                collapsed={sidebarCollapsed}
              />
            ))}

            {currentRole === 'admin' && (
              <>
                <SidebarSectionLabel label="Administração" collapsed={sidebarCollapsed} />
                {sidebarAdminItems.map((item) => (
                  <SidebarNavButton
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </>
            )}

            <SidebarSectionLabel label="Conta" collapsed={sidebarCollapsed} />
            {sidebarUtilityItems.map((item) => (
              <SidebarNavButton
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                collapsed={sidebarCollapsed}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border space-y-0.5">
          <SidebarNavButton
            item={{ path: "/configuracoes", icon: Settings, label: "Configurações" }}
            isActive={location.pathname === "/configuracoes"}
            onClick={() => navigate("/configuracoes")}
            collapsed={sidebarCollapsed}
          />
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-3 py-3 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all shadow-sm z-50"
        >
          <ChevronLeft className={cn("h-3 w-3 text-muted-foreground transition-transform", sidebarCollapsed && "rotate-180")} />
        </button>
      </aside>
      <OnboardingTour />
    </div>
    </TooltipProvider>
    </AppLayoutContext.Provider>
  );
}

export default AppLayout;