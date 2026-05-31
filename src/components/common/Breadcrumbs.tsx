import { ChevronRight, Home } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { haptics } from "@/utils/haptics";
import { BackButton } from "@/components/molecules/navigation/BackButton";

const routeLabels: Record<string, string> = {
  "/": "Início",
  "/dashboard": "Dashboard",
  "/dashboard-realtime": "Tempo Real",
  "/monitor": "Monitor Live",
  "/assistente-ia": "Assistente IA",
  "/recebimento": "Recebimento",
  "/triagem": "Triagem",
  "/estoque": "Estoque",
  "/scanner": "Scanner",
  "/romaneios": "Romaneios",
  "/kanban": "Kanban Pipeline",
  "/governanca": "Governança",
  "/produtos": "Produtos",
  "/lotes": "Lotes",
  "/posicoes": "Posições",
  "/categorias": "Categorias",
  "/movimentacao": "Movimentação",
  "/armazenamento": "Armazenamento",
  "/picking": "Picking",
  "/putaway": "Putaway",
  "/ondas": "Ondas",
  "/qualidade": "Qualidade",
  "/conferencia": "Conferência",
  "/expedicao": "Expedição",
  "/inventario": "Inventário Cíclico",
  "/curva-abc": "Curva ABC",
  "/tarefas": "Gestão Tarefas",
  "/alertas": "Alertas",
  "/kpis-operacionais": "KPIs Operacionais",
  "/produtividade": "Produtividade",
  "/gamificacao": "Gamificação",
  "/rastreabilidade": "Rastreabilidade",
  "/seriais": "Seriais",
  "/etiquetas": "Etiquetas QR",
  "/pedidos": "Pedidos",
  "/clientes": "Clientes",
  "/armazens": "Armazéns",
  "/fornecedores": "Qualidade Fornec.",
  "/fornecedores-avancado": "Fornecedores Score",
  "/trocas": "Trocas/Devoluções",
  "/trocas-dashboard": "Dashboard Trocas",
  "/divergencias": "Divergências",
  "/import-export": "Import/Export",
  "/automacoes": "Automações",
  "/aprovacoes": "Aprovações",
  "/relatorios-agendados": "Relatórios Agendados",
  "/enderecamento": "Endereçamento Auto",
  "/transportadoras": "Transportadoras",
  "/previsao-demanda": "Previsão Demanda",
  "/modo-offline": "Modo Offline",
  "/relatorios": "Relatórios",
  "/seguranca": "Segurança",
  "/ocupacao": "Ocupação Visual",
  "/configuracoes": "Configurações",
  "/perfil": "Meu Perfil",
  "/notificacoes": "Notificações",
  "/ajuda": "Ajuda",
  "/admin/usuarios": "Usuários",
  "/admin/roles": "Papéis",
  "/admin/configuracoes": "Config Admin",
  "/admin/auditoria": "Auditoria",
  "/admin/integracoes": "Integrações",
};

const sectionLabels: Record<string, string> = {
  admin: "Administração",
};

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Enhanced breadcrumb building with dynamic support
  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const items: { label: string; href?: string }[] = [{ label: "Início", href: "/" }];
    let accumulatedPath = "";

    segments.forEach((segment, i) => {
      accumulatedPath += `/${segment}`;
      const isLast = i === segments.length - 1;

      let label = routeLabels[accumulatedPath] || sectionLabels[segment] || segment;

      // Basic ID detection and masking
      if (segment.length > 20 && !routeLabels[accumulatedPath]) {
        label = "Detalhes";
      }

      items.push({
        label,
        href: isLast ? undefined : accumulatedPath,
      });
    });
    return items;
  }, [pathname]);

  // Don't show on home or dashboard, or when there's only the root item
  if (pathname === "/" || pathname === "/dashboard" || crumbs.length <= 1) return null;

  const container = {
    hidden: { opacity: 0, y: -10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -5 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.nav
      variants={container}
      initial="hidden"
      animate="show"
      aria-label="Breadcrumb"
      className={cn(
        "sticky top-16 z-30 flex items-center gap-3 border-b border-border/5 bg-background/50 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur-sm lg:px-6",
        className
      )}
    >
      <motion.div variants={item}>
        <BackButton size="sm" variant="ghost" className="transition-colors hover:bg-primary/10" />
      </motion.div>

      <div className="mx-1 h-4 w-[1px] shrink-0 bg-border/20" />

      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-1 pr-4">
        {crumbs.map((crumb, i) => (
          <motion.span
            key={i}
            variants={item}
            className="group/crumb flex items-center gap-1.5 whitespace-nowrap"
          >
            {i > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30 transition-colors group-hover/crumb:text-primary/50" />
            )}
            {i === 0 ? (
              <Link
                to="/"
                onClick={() => haptics.light()}
                className="group/home rounded-md p-1.5 transition-all hover:bg-primary/10 hover:text-primary active:scale-90"
                title="Página Inicial"
              >
                <Home className="h-3.5 w-3.5 transition-transform group-hover/home:scale-110" />
              </Link>
            ) : crumb.href ? (
              <Link
                to={crumb.href}
                onClick={() => haptics.light()}
                className="relative overflow-hidden rounded-md px-2 py-1 text-xs font-medium transition-all hover:bg-primary/10 hover:text-primary active:scale-95"
              >
                {crumb.label}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </Link>
            ) : (
              <span className="rounded-md border border-primary/10 bg-primary/5 px-2.5 py-1 text-xs font-bold text-foreground shadow-sm backdrop-blur-md">
                {crumb.label}
              </span>
            )}
          </motion.span>
        ))}
      </div>
    </motion.nav>
  );
}

export default Breadcrumbs;
