import { ReactNode, useEffect, createContext, useContext } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

// Context to prevent double-rendering when AppLayout is nested
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
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
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

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Início", tour: "inicio" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard", tour: "dashboard" },
  { path: "/recebimento", icon: Package, label: "Receber", tour: "recebimento" },
  { path: "/triagem", icon: Search, label: "Triagem", tour: "triagem" },
  { path: "/estoque", icon: Warehouse, label: "Estoque", tour: "estoque" },
  { path: "/scanner", icon: QrCode, label: "Scanner", tour: "scanner" },
  { path: "/romaneios", icon: Truck, label: "Romaneios", tour: "romaneios" },
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

export function AppLayout({ children, title, showBack = false, rightAction }: AppLayoutProps) {
  const isNested = useContext(AppLayoutContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const { permission, isSupported, requestPermission } = usePushNotifications();

  // Solicitar permissão de push notifications na primeira visita
  useEffect(() => {
    if (isSupported && permission === "default") {
      requestPermission();
    }
  }, [isSupported, permission, requestPermission]);

  // If already inside an AppLayout, just render children
  if (isNested) {
    return <>{children}</>;
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
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="sticky bottom-0 bg-card border-t border-border px-2 py-2 md:hidden">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
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

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                data-tour={item.tour}
                onClick={() => navigate(item.path)}
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
          })}
          
          <div className="pt-4 border-t border-sidebar-border mt-4 space-y-1">
            <button
              onClick={() => navigate("/movimentacao")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/movimentacao"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <ArrowLeftRight className="h-5 w-5" />
              <span className="font-medium">Movimentação</span>
            </button>
            <button
              onClick={() => navigate("/produtividade")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/produtividade"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Produtividade</span>
            </button>
            <button
              onClick={() => navigate("/inventario-ciclico")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/inventario-ciclico"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <ClipboardList className="h-5 w-5" />
              <span className="font-medium">Inventário Cíclico</span>
            </button>
            <button
              onClick={() => navigate("/curva-abc")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/curva-abc"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Layers className="h-5 w-5" />
              <span className="font-medium">Curva ABC</span>
            </button>
            <button
              onClick={() => navigate("/gestao-tarefas")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/gestao-tarefas"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <ListTodo className="h-5 w-5" />
              <span className="font-medium">Gestão Tarefas</span>
            </button>
            <button
              onClick={() => navigate("/alertas")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/alertas"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <BellRing className="h-5 w-5" />
              <span className="font-medium">Alertas</span>
            </button>
            <button
              onClick={() => navigate("/kpis")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/kpis"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Activity className="h-5 w-5" />
              <span className="font-medium">KPIs</span>
            </button>
            <button
              onClick={() => navigate("/rastreabilidade")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/rastreabilidade"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Route className="h-5 w-5" />
              <span className="font-medium">Rastreabilidade</span>
            </button>
            <button
              onClick={() => navigate("/qualidade-fornecedores")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/qualidade-fornecedores"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Building2 className="h-5 w-5" />
              <span className="font-medium">Qualidade Fornec.</span>
            </button>
            <button
              onClick={() => navigate("/trocas-devolucoes")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/trocas-devolucoes"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Undo2 className="h-5 w-5" />
              <span className="font-medium">Trocas/Devoluções</span>
            </button>
            <button
              onClick={() => navigate("/dashboard-trocas")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/dashboard-trocas"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Dashboard Trocas</span>
            </button>
            <button
              onClick={() => navigate("/divergencias")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/divergencias"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Divergências</span>
            </button>
            <button
              onClick={() => navigate("/relatorios")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/relatorios"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Relatórios</span>
            </button>
            <button
              onClick={() => navigate("/minha-produtividade")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                location.pathname === "/minha-produtividade"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Activity className="h-5 w-5" />
              <span className="font-medium">Minha Produtividade</span>
            </button>
          </div>
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button 
            onClick={() => navigate("/configuracoes")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              location.pathname === "/configuracoes"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Configurações</span>
          </button>
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
  );
}

export default AppLayout;

