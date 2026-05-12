 import { LayoutDashboard, Package, FileSearch, Truck, ArrowLeftRight, FileText, Settings, Trophy, BarChart3, Layers, MapPin, Waves, ListChecks, AlertTriangle, ClipboardList, TrendingUp, RefreshCw } from "lucide-react";

export const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Estoque", path: "/estoque", icon: Package },
  { name: "Produtos", path: "/produtos", icon: Layers },
  { name: "Posições", path: "/posicoes", icon: MapPin },
  { name: "Lotes", path: "/lotes", icon: ClipboardList },
  { name: "Triagem", path: "/triagem", icon: FileSearch },
  { name: "Recebimento", path: "/recebimento", icon: Truck },
  { name: "Movimentação", path: "/movimentacao", icon: ArrowLeftRight },
  { name: "Tarefas", path: "/tarefas", icon: ListChecks },
  { name: "Ondas", path: "/ondas", icon: Waves },
  { name: "Romaneios", path: "/romaneios", icon: TrendingUp },
  { name: "Relatórios", path: "/relatorios", icon: FileText },
  { name: "KPIs", path: "/kpis-operacionais", icon: BarChart3 },
  { name: "Gamificação", path: "/gamificacao", icon: Trophy },
   { name: "Hub Central", path: "/hub", icon: RefreshCw },
  { name: "Configurações", path: "/configuracoes", icon: Settings },
];

export const getActiveMenuItem = (pathname: string) => menuItems.find(item => pathname.startsWith(item.path));
