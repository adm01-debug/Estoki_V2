import { ReactNode, useEffect, createContext, useContext } from "react";
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
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
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
  { path: "/recebimento", icon: Package, label: "Receber", tour: "recebimento" },
  { path: "/triagem", icon: Search, label: "Triagem", tour: "triagem" },
  { path: "/estoque", icon: Warehouse, label: "Estoque", tour: "estoque" },
  { path: "/scanner", icon: QrCode, label: "Scanner", tour: "scanner" },
  { path: "/romaneios", icon: Truck, label: "Romaneios", tour: "romaneios" },
];

const sidebarSecondaryItems: NavItem[] = [
  { path: "/movimentacao", icon: ArrowLeftRight, label: "Movimentação" },
  { path: "/produtividade", icon: Users, label: "Produtividade" },
  { path: "/inventario", icon: ClipboardList, label: "Inventário Cíclico" },
  { path: "/curva-abc", icon: Layers, label: "Curva ABC" },
  { path: "/tarefas", icon: ListTodo, label: "Gestão Tarefas" },
  { path: "/alertas", icon: BellRing, label: "Alertas" },
  { path: "/kpis", icon: Activity, label: "KPIs" },
  { path: "/rastreabilidade", icon: Route, label: "Rastreabilidade" },
  { path: "/fornecedores", icon: Building2, label: "Qualidade Fornec." },
  { path: "/trocas", icon: Undo2, label: "Trocas/Devoluções" },
  { path: "/trocas-dashboard", icon: BarChart3, label: "Dashboard Trocas" },
  { path: "/divergencias", icon: AlertTriangle, label: "Divergências" },
  { path: "/relatorios", icon: FileText, label: "Relatórios" },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-red-500/20 text-red-700 border-red-500/30";
    case "supervisor": return "bg-blue-500/20 text-blue-700 border-blue-500/30";
    default: return "bg-green-500/20 text-green-700 border-green-500/30";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin": return "Administrador";
    case "supervisor": return "Supervisor";
    default: return "Operador";
  }
};

function SidebarNavButton({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  return (
    <button
      data-tour={item.tour}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
        isActive 
          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.label}</span>
    </button>
  );
}

export function AppLayout({ children, title, showBack = false, rightAction }: AppLayoutProps) {
  const isNested = useContext(AppLayoutContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut, loading } = useAuth();
  const { permission, isSupported, requestPermission } = usePushNotifications();

  useEffect(() => {
    if (isSupported && permission === "default") {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  if (isNested) {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="min-h-screen bg-background" />;
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

  return (
    <AppLayoutContext.Provider value={true}>
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {showBack ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="touch-friendly"
                aria-label="Voltar para página anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Warehouse className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground hidden sm:block">
                  Estoque & Triagem
                </span>
              </div>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <NotificationCenter />
            <ThemeToggle />
            {rightAction}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="touch-friendly relative" aria-label="Menu do usuário">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                    <Badge variant="outline" className={cn("w-fit mt-1", getRoleBadgeColor(currentRole))}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleLabel(currentRole)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:pl-64">
        <div className="max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="sticky bottom-0 bg-card border-t border-border px-2 py-2 md:hidden">
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
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-friendly",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col z-40">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Warehouse className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">Promo Brindes</h1>
              <p className="text-xs text-sidebar-foreground/60">Estoque & Triagem</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userName}
              </p>
              <Badge variant="outline" className={cn("text-xs scale-90 origin-left", getRoleBadgeColor(currentRole))}>
                {getRoleLabel(currentRole)}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarMainItems.map((item) => (
            <SidebarNavButton
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
          
          <div className="pt-4 border-t border-sidebar-border mt-4 space-y-1">
            {sidebarSecondaryItems.map((item) => (
              <SidebarNavButton
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <SidebarNavButton
            item={{ path: "/configuracoes", icon: Settings, label: "Configurações" }}
            isActive={location.pathname === "/configuracoes"}
            onClick={() => navigate("/configuracoes")}
          />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </div>
    </AppLayoutContext.Provider>
  );
}

export default AppLayout;
