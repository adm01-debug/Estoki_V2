import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  estoque: "Estoque",
  triagem: "Triagem",
  recebimento: "Recebimento",
  movimentacao: "Movimentação",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const autoItems: BreadcrumbItem[] = pathSegments.map((segment, index) => ({
    label: routeLabels[segment] || segment,
    href: "/" + pathSegments.slice(0, index + 1).join("/"),
  }));

  const breadcrumbs = items || autoItems;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      <Link to="/" className="text-muted-foreground hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.href && index < breadcrumbs.length - 1 ? (
            <Link to={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
