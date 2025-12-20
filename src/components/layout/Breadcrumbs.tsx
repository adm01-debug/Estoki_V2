import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeNames: Record<string, string> = {
  "": "Início",
  "dashboard": "Dashboard",
  "recebimento": "Recebimento",
  "triagem": "Triagem",
  "estoque": "Estoque",
  "scanner": "Scanner",
  "movimentacao": "Movimentação",
  "produtividade": "Produtividade",
  "inventario-ciclico": "Inventário Cíclico",
  "curva-abc": "Curva ABC",
  "gestao-tarefas": "Gestão de Tarefas",
  "alertas": "Alertas",
  "kpis": "KPIs",
  "rastreabilidade": "Rastreabilidade",
  "qualidade-fornecedores": "Qualidade Fornecedores",
  "trocas-devolucoes": "Trocas e Devoluções",
  "dashboard-trocas": "Dashboard Trocas",
  "divergencias": "Divergências",
  "relatorios": "Relatórios",
  "minha-produtividade": "Minha Produtividade",
  "configuracoes": "Configurações",
  "conferencia-recebimento": "Conferência",
  "formulario-triagem": "Formulário Triagem",
  "armazenamento": "Armazenamento",
  "dashboard-triador": "Dashboard Triador",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Ir para página inicial"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Início</span>
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const name = routeNames[value] || value;

          return (
            <li key={to} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {name}
                </span>
              ) : (
                <Link
                  to={to}
                  className="hover:text-foreground transition-colors"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
