import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '/': 'Início',
  '/dashboard': 'Dashboard',
  '/recebimento': 'Recebimento',
  '/triagem': 'Triagem',
  '/estoque': 'Estoque',
  '/scanner': 'Scanner',
  '/romaneios': 'Romaneios',
  '/produtos': 'Produtos',
  '/lotes': 'Lotes',
  '/posicoes': 'Posições',
  '/categorias': 'Categorias',
  '/movimentacao': 'Movimentação',
  '/armazenamento': 'Armazenamento',
  '/picking': 'Picking',
  '/putaway': 'Putaway',
  '/ondas': 'Ondas',
  '/qualidade': 'Qualidade',
  '/conferencia': 'Conferência',
  '/expedicao': 'Expedição',
  '/inventario': 'Inventário Cíclico',
  '/curva-abc': 'Curva ABC',
  '/tarefas': 'Gestão Tarefas',
  '/alertas': 'Alertas',
  '/kpis-operacionais': 'KPIs Operacionais',
  '/produtividade': 'Produtividade',
  '/gamificacao': 'Gamificação',
  '/rastreabilidade': 'Rastreabilidade',
  '/seriais': 'Seriais',
  '/pedidos': 'Pedidos',
  '/clientes': 'Clientes',
  '/armazens': 'Armazéns',
  '/fornecedores': 'Qualidade Fornec.',
  '/trocas': 'Trocas/Devoluções',
  '/trocas-dashboard': 'Dashboard Trocas',
  '/divergencias': 'Divergências',
  '/relatorios': 'Relatórios',
  '/seguranca': 'Segurança',
  '/configuracoes': 'Configurações',
  '/perfil': 'Meu Perfil',
  '/notificacoes': 'Notificações',
  '/ajuda': 'Ajuda',
  '/admin/usuarios': 'Usuários',
  '/admin/roles': 'Papéis',
  '/admin/configuracoes': 'Config Admin',
  '/admin/auditoria': 'Auditoria',
  '/admin/integracoes': 'Integrações',
};

const sectionLabels: Record<string, string> = {
  admin: 'Administração',
};

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't show on home
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Início', href: '/' }];

  // Build breadcrumbs from segments
  let accumulatedPath = '';
  segments.forEach((segment, i) => {
    accumulatedPath += `/${segment}`;
    const isLast = i === segments.length - 1;
    const label = routeLabels[accumulatedPath] || sectionLabels[segment] || segment;
    crumbs.push({
      label,
      href: isLast ? undefined : accumulatedPath,
    });
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 px-4 lg:px-6 py-2 text-sm text-muted-foreground', className)}
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
          {i === 0 ? (
            <Link to="/" className="hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
          ) : crumb.href ? (
            <Link to={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
