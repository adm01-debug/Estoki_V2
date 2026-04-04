import { ReactNode, useEffect, createContext, useContext, useState, useCallback, memo, useMemo } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import { useRoutePreload } from "@/hooks/useRoutePreload";
import { prefetchCriticalRoutes } from "@/lib/prefetch";
import { useSwipeBack } from "@/hooks/useSwipeBack";

const AppLayoutContext = createContext(false);
import { 
  LayoutDashboard, 
  Package, 
  Search, 
  Warehouse,
  Box, 
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
  Menu,
  X,
  Radio,
  CalendarClock,
  ShieldCheck,
  WifiOff,
  MapPin,
  Brain,
  Tag,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { motion, AnimatePresence } from "framer-motion";

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
  badge?: number;
}

// Bottom nav (mobile) - 4 items + FAB center
const mobileNavItems: NavItem[] = [
  { path: "/", icon: LayoutDashboard, label: "Início", tour: "inicio" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard", tour: "dashboard" },
  // FAB goes here (index 2)
  { path: "/recebimento", icon: Package, label: "Receber", tour: "recebimento" },
  { path: "/estoque", icon: Warehouse, label: "Estoque", tour: "estoque" },
];

// Quick actions for FAB
const fabActions: NavItem[] = [
  { path: "/scanner", icon: QrCode, label: "Scanner" },
  { path: "/triagem", icon: Search, label: "Triagem" },
  { path: "/picking", icon: ListTodo, label: "Picking" },
  { path: "/movimentacao", icon: ArrowLeftRight, label: "Movimentar" },
];

// Main sidebar sections
const sidebarMainItems: NavItem[] = [
  { path: "/", icon: LayoutDashboard, label: "Início", tour: "inicio" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard", tour: "dashboard" },
  { path: "/dashboard-realtime", icon: Radio, label: "Tempo Real", tour: "realtime" },
  { path: "/monitor", icon: Activity, label: "Monitor Live", tour: "monitor" },
  { path: "/assistente-ia", icon: Sparkles, label: "Assistente IA", tour: "assistente-ia" },
  { path: "/recebimento", icon: Package, label: "Receber", tour: "recebimento" },
  { path: "/triagem", icon: Search, label: "Triagem", tour: "triagem" },
  { path: "/estoque", icon: Warehouse, label: "Estoque", tour: "estoque" },
  { path: "/governanca", icon: Shield, label: "Governança", tour: "governanca" },
  { path: "/scanner", icon: QrCode, label: "Scanner", tour: "scanner" },
  { path: "/romaneios", icon: Truck, label: "Romaneios", tour: "romaneios" },
  { path: "/kanban", icon: Layers, label: "Kanban Pipeline", tour: "kanban" },
];

interface SidebarGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Cadastros",
    icon: FolderTree,
    items: [
      { path: "/produtos", icon: Package, label: "Produtos" },
      { path: "/lotes", icon: Layers, label: "Lotes" },
      { path: "/posicoes", icon: Warehouse, label: "Posições" },
      { path: "/categorias", icon: FolderTree, label: "Categorias" },
      { path: "/armazens", icon: Building2, label: "Armazéns" },
      { path: "/clientes", icon: Users, label: "Clientes" },
      { path: "/seriais", icon: QrCode, label: "Seriais" },
      { path: "/etiquetas", icon: Tag, label: "Etiquetas QR" },
    ],
  },
  {
    label: "Movimentação",
    icon: ArrowLeftRight,
    items: [
      { path: "/movimentacao", icon: ArrowLeftRight, label: "Movimentação" },
      { path: "/armazenamento", icon: Building2, label: "Armazenamento" },
      { path: "/picking", icon: ListTodo, label: "Picking" },
      { path: "/putaway", icon: Package, label: "Putaway" },
      { path: "/ondas", icon: Route, label: "Ondas" },
      { path: "/conferencia", icon: Scan, label: "Conferência" },
      { path: "/expedicao", icon: Truck, label: "Expedição" },
      { path: "/transportadoras", icon: Truck, label: "Transportadoras" },
      { path: "/enderecamento", icon: MapPin, label: "Endereçamento Auto" },
    ],
  },
  {
    label: "Qualidade",
    icon: ClipboardList,
    items: [
      { path: "/qualidade", icon: ClipboardList, label: "Qualidade" },
      { path: "/divergencias", icon: AlertTriangle, label: "Divergências" },
      { path: "/fornecedores", icon: Building2, label: "Qualidade Fornec." },
      { path: "/fornecedores-avancado", icon: Building2, label: "Fornecedores Score" },
      { path: "/trocas", icon: Undo2, label: "Trocas/Devoluções" },
      { path: "/trocas-dashboard", icon: BarChart3, label: "Dashboard Trocas" },
      { path: "/aprovacoes", icon: ShieldCheck, label: "Aprovações" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    items: [
      { path: "/kpis-operacionais", icon: Activity, label: "KPIs" },
      { path: "/curva-abc", icon: Layers, label: "Curva ABC" },
      { path: "/produtividade", icon: Users, label: "Produtividade" },
      { path: "/rastreabilidade", icon: Route, label: "Rastreabilidade" },
      { path: "/relatorios", icon: FileText, label: "Relatórios" },
      { path: "/relatorios-agendados", icon: CalendarClock, label: "Relat. Agendados" },
      { path: "/previsao-demanda", icon: Brain, label: "Previsão Demanda" },
      { path: "/ocupacao", icon: Warehouse, label: "Ocupação Visual" },
    ],
  },
  {
    label: "Gestão",
    icon: Settings,
    items: [
      { path: "/inventario", icon: ClipboardList, label: "Inventário Cíclico" },
      { path: "/tarefas", icon: ListTodo, label: "Gestão Tarefas" },
      { path: "/alertas", icon: BellRing, label: "Alertas" },
      { path: "/gamificacao", icon: Activity, label: "Gamificação" },
      { path: "/pedidos", icon: FileText, label: "Pedidos" },
      { path: "/import-export", icon: FileText, label: "Import/Export" },
      { path: "/automacoes", icon: Sparkles, label: "Automações" },
      { path: "/seguranca", icon: Shield, label: "Segurança" },
      { path: "/modo-offline", icon: WifiOff, label: "Modo Offline" },
    ],
  },
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

const SidebarNavButton = memo(function SidebarNavButton({ item, isActive, onClick, collapsed, onHover }: { item: NavItem; isActive: boolean; onClick: () => void; collapsed: boolean; onHover?: (path: string) => void }) {
  const buttonProps = {
    "data-tour": item.tour,
    onClick,
    whileHover: { x: collapsed ? 0 : 4 },
    whileTap: { scale: 0.97 },
    className: cn(
      "w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
      collapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5",
      isActive
        ? "bg-primary/15 text-primary"
        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80"
    ),
  };

  const content = (
    <>
      {isActive && (
        <motion.div
          layoutId="sidebar-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className={cn(
        "relative flex items-center justify-center",
        isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
      )}>
        <item.icon className={cn(
          "h-[18px] w-[18px] shrink-0 transition-all duration-200",
          isActive ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
        )} />
      </div>
      {!collapsed && (
        <span className={cn(
          "text-sm transition-colors truncate",
          isActive ? "font-semibold" : "font-medium"
        )}>{item.label}</span>
      )}
      {item.badge && item.badge > 0 && !collapsed && (
        <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
          {item.badge}
        </span>
      )}
    </>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button type="button" onClick={onClick} onMouseEnter={() => onHover?.(item.path)} data-tour={item.tour} className={buttonProps.className}>
            {content}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <motion.button {...buttonProps} onMouseEnter={() => onHover?.(item.path)}>{content}</motion.button>;
});

function SidebarSectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-3 mx-3 border-t border-sidebar-border/50" />;
  return (
    <p className="px-3 text-[10px] font-bold text-primary/50 uppercase tracking-[0.2em] mb-1.5 mt-5 flex items-center gap-2">
      <span className="w-4 h-px bg-primary/20" />
      {label}
    </p>
  );
}

const SidebarAccordionGroup = memo(function SidebarAccordionGroup({
  group,
  collapsed,
  pathname,
  onNavigate,
  onHover,
}: {
  group: SidebarGroup;
  collapsed: boolean;
  pathname: string;
  onNavigate: (path: string) => void;
  onHover?: (path: string) => void;
}) {
  const hasActiveChild = group.items.some((item) => pathname === item.path || pathname.startsWith(item.path + "/"));
  const activeCount = group.items.filter((item) => pathname === item.path).length;
  const [open, setOpen] = useState(hasActiveChild);

  // Auto-open when a child becomes active
  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  if (collapsed) {
    // When collapsed, show only the group icon with tooltip showing group name
    return (
      <>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="mx-3 my-1 flex items-center justify-center">
              <group.icon className={cn(
                "h-4 w-4 transition-colors",
                hasActiveChild ? "text-primary" : "text-sidebar-foreground/30"
              )} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border-border font-medium">
            {group.label}
          </TooltipContent>
        </Tooltip>
        {group.items.map((item) => (
          <SidebarNavButton
            key={item.path}
            item={item}
            isActive={pathname === item.path}
            onClick={() => onNavigate(item.path)}
            collapsed={true}
            onHover={onHover}
          />
        ))}
      </>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group/trigger mt-1",
            hasActiveChild
              ? "text-primary"
              : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <group.icon className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            hasActiveChild ? "text-primary" : "text-sidebar-foreground/30 group-hover/trigger:text-sidebar-foreground/60"
          )} />
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider flex-1 text-left",
            hasActiveChild ? "text-primary/80" : ""
          )}>
            {group.label}
          </span>
          {hasActiveChild && (
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary" />
          )}
          <ChevronRight className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-90"
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-1 space-y-0.5 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        {group.items.map((item) => (
          <SidebarNavButton
            key={item.path}
            item={item}
            isActive={pathname === item.path}
            onClick={() => onNavigate(item.path)}
            collapsed={false}
            onHover={onHover}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

// Determine parent route for smart back navigation
function getParentRoute(pathname: string): string {
  // If deep route like /admin/usuarios, go to parent section
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 1) {
    return "/" + segments.slice(0, -1).join("/");
  }
  // For top-level routes, go to home
  return "/";
}

export function AppLayout({ children, title, showBack = false, rightAction }: AppLayoutProps) {
  const isNested = useContext(AppLayoutContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut, loading } = useAuth();
  const { permission, isSupported, requestPermission } = usePushNotifications();
  const preloadRoute = useRoutePreload();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Smart back: always show on non-home routes
  const isHome = location.pathname === "/";
  const shouldShowBack = showBack || !isHome;
  const parentRoute = getParentRoute(location.pathname);

  const handleBack = useCallback(() => {
    // If there's browser history, use it; otherwise go to parent route
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(parentRoute);
    }
  }, [navigate, parentRoute]);

  // Keyboard shortcut: Alt+Left for back navigation
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

  // Enable swipe-from-edge back gesture on mobile
  useSwipeBack(!isHome);

  // Prefetch critical routes after mount
  useEffect(() => {
    prefetchCriticalRoutes();
  }, []);

  useEffect(() => {
    if (isSupported && permission === "default") {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isNested) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
              <Box className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="absolute -inset-2 rounded-2xl bg-primary/20 animate-ping" />
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div 
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
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

  const sidebarWidth = sidebarCollapsed ? "w-[72px]" : "w-[260px]";
  const mainPadding = sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]";

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Logo */}
      <div className={cn("p-4 border-b border-sidebar-border/50", sidebarCollapsed && !isMobile && "p-3")}>
        <div className={cn("flex items-center", (sidebarCollapsed && !isMobile) ? "justify-center" : "gap-3")}>
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/50 flex items-center justify-center shadow-glow shrink-0"
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <Box className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="min-w-0">
              <h1 className="font-extrabold text-sidebar-foreground text-base tracking-tight gradient-text">ESTOKI</h1>
              <p className="text-[10px] text-sidebar-foreground/30 font-medium tracking-wide">ESTOQUE INTELIGENTE</p>
            </div>
          )}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(false)}
              className="ml-auto text-sidebar-foreground/50 hover:text-sidebar-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      {(!sidebarCollapsed || isMobile) && (
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
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {userName}
              </p>
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
          <SidebarSectionLabel label="Principal" collapsed={sidebarCollapsed && !isMobile} />
          {sidebarMainItems.map((item) => (
            <SidebarNavButton
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              onClick={() => { navigate(item.path); if (isMobile) setMobileMenuOpen(false); }}
              collapsed={sidebarCollapsed && !isMobile}
              onHover={preloadRoute}
            />
          ))}
          
          <SidebarSectionLabel label="Operações" collapsed={sidebarCollapsed && !isMobile} />
          {sidebarGroups.map((group) => (
            <SidebarAccordionGroup
              key={group.label}
              group={group}
              collapsed={sidebarCollapsed && !isMobile}
              pathname={location.pathname}
              onNavigate={(path) => { navigate(path); if (isMobile) setMobileMenuOpen(false); }}
              onHover={preloadRoute}
            />
          ))}

          {currentRole === 'admin' && (
            <>
              <SidebarSectionLabel label="Administração" collapsed={sidebarCollapsed && !isMobile} />
              {sidebarAdminItems.map((item) => (
                <SidebarNavButton
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onClick={() => { navigate(item.path); if (isMobile) setMobileMenuOpen(false); }}
                  collapsed={sidebarCollapsed && !isMobile}
                  onHover={preloadRoute}
                />
              ))}
            </>
          )}

          <SidebarSectionLabel label="Conta" collapsed={sidebarCollapsed && !isMobile} />
          {sidebarUtilityItems.map((item) => (
            <SidebarNavButton
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              onClick={() => { navigate(item.path); if (isMobile) setMobileMenuOpen(false); }}
              collapsed={sidebarCollapsed && !isMobile}
              onHover={preloadRoute}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border/50 space-y-0.5">
        <SidebarNavButton
          item={{ path: "/configuracoes", icon: Settings, label: "Configurações" }}
          isActive={location.pathname === "/configuracoes"}
          onClick={() => { navigate("/configuracoes"); if (isMobile) setMobileMenuOpen(false); }}
          collapsed={sidebarCollapsed && !isMobile}
          onHover={preloadRoute}
        />
        {(sidebarCollapsed && !isMobile) ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-3 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair</TooltipContent>
          </Tooltip>
        ) : (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <AppLayoutContext.Provider value={true}>
    <TooltipProvider>
    <div className="min-h-screen bg-background flex flex-col" role="application" aria-label="ESTOKI WMS">
      {/* Skip to content link for keyboard/screen reader users */}
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
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden touch-friendly hover:bg-primary/10"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {shouldShowBack && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleBack}
                    className="touch-friendly hover:bg-primary/10"
                    aria-label="Voltar (Alt+←)"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Voltar <kbd className="ml-1 px-1 py-0.5 rounded bg-muted text-[10px]">Alt+←</kbd>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow-sm">
                <Box className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-foreground gradient-text hidden sm:block">ESTOKI</span>
            </div>

            {title && (
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h1>
            )}
            
            {/* Breadcrumbs in header on desktop */}
            <div className="hidden lg:block">
              <Breadcrumbs />
            </div>
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
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className={cn("flex-1 overflow-auto transition-all duration-300 relative z-10", mainPadding)} aria-label="Conteúdo principal">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile breadcrumbs */}
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

      {/* Bottom Navigation (Mobile) */}
      <nav className="sticky bottom-0 border-t border-border/40 px-1 py-1 md:hidden safe-area-bottom relative" aria-label="Navegação mobile">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl" />
        <div className="relative flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                data-tour={item.tour}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.9 }}
                aria-label={`Ir para ${item.label}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] px-2 py-1.5 rounded-xl transition-all duration-200 relative",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="bottomnav-indicator"
                    className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} aria-hidden="true" />
                <span className={cn("text-[10px] font-medium leading-tight", isActive && "font-bold text-primary")}>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside 
              className="fixed left-0 top-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border/50 flex flex-col z-50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside aria-label="Navegação principal" className={cn(
        "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border/50 hidden lg:flex flex-col z-40 transition-all duration-300",
        sidebarWidth
      )}>
        {renderSidebarContent(false)}

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all shadow-md z-50"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-300", sidebarCollapsed && "rotate-180")} />
        </motion.button>
      </aside>
      <OnboardingTour />
    </div>
    </TooltipProvider>
    </AppLayoutContext.Provider>
  );
}

export default AppLayout;

