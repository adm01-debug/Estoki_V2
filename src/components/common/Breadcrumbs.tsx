import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { haptics } from '@/utils/haptics';
import { BackButton } from '@/components/molecules/navigation/BackButton';

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

   // Don't show on home or dashboard
   if (pathname === '/' || pathname === '/dashboard') return null;

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
       className={cn('flex items-center gap-4 px-4 lg:px-6 py-2 text-sm text-muted-foreground', className)}
     >
       <button 
         onClick={() => navigate(-1)}
         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border/40 text-xs font-bold uppercase tracking-wider hover:bg-muted hover:text-primary transition-all active:scale-95 group shadow-sm"
         aria-label="Voltar"
       >
         <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
         <span className="hidden sm:inline">Voltar</span>
       </button>
       
       <div className="h-4 w-[1px] bg-border/40 mx-1 shrink-0" />
 
       <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 pr-4">
         {crumbs.map((crumb, i) => (
           <span key={i} className="flex items-center gap-1.5 group/crumb whitespace-nowrap">
             {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />}
             {i === 0 ? (
               <Link 
                 to="/" 
                 className="p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                 title="Página Inicial"
               >
                 <Home className="h-3.5 w-3.5" />
               </Link>
             ) : crumb.href ? (
               <Link 
                 to={crumb.href} 
                 className="px-2 py-1 rounded-md hover:bg-primary/10 hover:text-primary transition-all font-medium active:scale-95 text-xs"
               >
                 {crumb.label}
               </Link>
             ) : (
               <span className="px-2.5 py-1 text-xs font-bold text-foreground bg-muted/40 rounded-md shadow-sm border border-border/20">
                 {crumb.label}
               </span>
             )}
           </span>
         ))}
       </div>
     </nav>
   );
}

export default Breadcrumbs;
