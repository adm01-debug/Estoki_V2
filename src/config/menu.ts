import { LayoutDashboard, Package, FileSearch, Truck, ArrowLeftRight, FileText, Settings, Trophy, BarChart3 } from "lucide-react";

export const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Estoque", path: "/estoque", icon: Package },
  { name: "Triagem", path: "/triagem", icon: FileSearch },
  { name: "Recebimento", path: "/recebimento", icon: Truck },
  { name: "Movimentação", path: "/movimentacao", icon: ArrowLeftRight },
  { name: "Relatórios", path: "/relatorios", icon: FileText },
  { name: "KPIs", path: "/kpis-operacionais", icon: BarChart3 },
  { name: "Gamificação", path: "/produtividade", icon: Trophy },
  { name: "Configurações", path: "/configuracoes", icon: Settings },
];

export const getActiveMenuItem = (pathname: string) => menuItems.find(item => pathname.startsWith(item.path));
