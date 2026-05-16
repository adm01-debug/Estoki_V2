 import { ChevronRight, Home, ChevronLeft } from 'lucide-react';
 import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  '/': 'Início',
  '/dashboard': 'Dashboard',
  '/dashboard-realtime': 'Tempo Real',
  '/monitor': 'Monitor Live',
  '/assistente-ia': 'Assistente IA',
  '/recebimento': 'Recebimento',
  '/triagem': 'Triagem',
  '/estoque': 'Estoque',
  '/scanner': 'Scanner',
  '/romaneios': 'Romaneios',
  '/kanban': 'Kanban Pipeline',
  '/governanca': 'Governança',
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
  '/etiquetas': 'Etiquetas QR',
  '/pedidos': 'Pedidos',
  '/clientes': 'Clientes',
  '/armazens': 'Armazéns',
  '/fornecedores': 'Qualidade Fornec.',
  '/fornecedores-avancado': 'Fornecedores Score',
  '/trocas': 'Trocas/Devoluções',
  '/trocas-dashboard': 'Dashboard Trocas',
  '/divergencias': 'Divergências',
  '/import-export': 'Import/Export',
  '/automacoes': 'Automações',
  '/aprovacoes': 'Aprovações',
  '/relatorios-agendados': 'Relatórios Agendados',
  '/enderecamento': 'Endereçamento Auto',
  '/transportadoras': 'Transportadoras',
  '/previsao-demanda': 'Previsão Demanda',
  '/modo-offline': 'Modo Offline',
  '/relatorios': 'Relatórios',
  '/seguranca': 'Segurança',
  '/ocupacao': 'Ocupação Visual',
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
   const navigate = useNavigate();
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
       className={cn('flex items-center justify-between px-4 lg:px-6 py-2 text-sm text-muted-foreground', className)}
     >
       <div className="flex items-center gap-1.5">
         <button 
           onClick={() => navigate(-1)} 
           className="mr-2 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 sm:hidden group"
           aria-label="Voltar"
         >
           <ChevronLeft className="h-4 w-4 group-active:scale-90 transition-transform" />
           <span className="text-xs font-medium">Voltar</span>
         </button>
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
       </div>
     </nav>
   );
}

export default Breadcrumbs;
