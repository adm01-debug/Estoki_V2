import {
  LayoutDashboard, Package, Search, Warehouse, Box, QrCode,
  ArrowLeftRight, Truck, Undo2, Settings, BarChart3, Shield,
  Users, ClipboardList, Layers, ListTodo, BellRing, Activity,
  Route, Building2, FileText, AlertTriangle, UserCircle, HelpCircle,
  Bell, FolderTree, Scan, Sparkles, Radio, CalendarClock, ShieldCheck,
  WifiOff, MapPin, Brain, Tag, Zap,
  type LucideIcon
} from "lucide-react";

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  tour?: string;
  badge?: number;
}

export interface SidebarGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const mobileNavItems: NavItem[] = [
  { path: "/", icon: LayoutDashboard, label: "Início", tour: "inicio" },
  { path: "/dashboard", icon: BarChart3, label: "Dashboard", tour: "dashboard" },
  { path: "/recebimento", icon: Package, label: "Receber", tour: "recebimento" },
  { path: "/estoque", icon: Warehouse, label: "Estoque", tour: "estoque" },
];

export const fabActions: NavItem[] = [
  { path: "/scanner", icon: QrCode, label: "Scanner" },
  { path: "/triagem", icon: Search, label: "Triagem" },
  { path: "/picking", icon: ListTodo, label: "Picking" },
  { path: "/movimentacao", icon: ArrowLeftRight, label: "Movimentar" },
];

export const sidebarMainItems: NavItem[] = [
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

export const sidebarGroups: SidebarGroup[] = [
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
      { path: "/inventory", icon: ClipboardList, label: "Inventário Geral" },
      { path: "/inventario", icon: Zap, label: "Inventário Cíclico" },
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

export const sidebarAdminItems: NavItem[] = [
  { path: "/admin/usuarios", icon: Users, label: "Usuários" },
  { path: "/admin/roles", icon: Shield, label: "Papéis" },
  { path: "/admin/configuracoes", icon: Settings, label: "Config Admin" },
  { path: "/admin/auditoria", icon: ClipboardList, label: "Auditoria" },
  { path: "/admin/integracoes", icon: Activity, label: "Integrações" },
];

export const sidebarUtilityItems: NavItem[] = [
  { path: "/perfil", icon: UserCircle, label: "Meu Perfil" },
  { path: "/notificacoes", icon: Bell, label: "Notificações" },
  { path: "/ajuda", icon: HelpCircle, label: "Ajuda" },
];

export function getAllNavItems(): NavItem[] {
  return [
    ...sidebarMainItems,
    ...sidebarGroups.flatMap(g => g.items),
    ...sidebarAdminItems,
    ...sidebarUtilityItems,
  ];
}

export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-primary/20 text-primary border-primary/30";
    case "supervisor": return "bg-info/20 text-info border-info/30";
    default: return "bg-success/20 text-success border-success/30";
  }
};

export const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin": return "Administrador";
    case "supervisor": return "Supervisor";
    default: return "Operador";
  }
};
