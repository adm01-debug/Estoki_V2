import { Link, useLocation } from "react-router-dom";
import { Home, Package, FileSearch, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Início" },
  { path: "/estoque", icon: Package, label: "Estoque" },
  { path: "/triagem", icon: FileSearch, label: "Triagem" },
  { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} className={cn("flex flex-col items-center gap-1 px-3 py-2", isActive ? "text-primary" : "text-muted-foreground")}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
