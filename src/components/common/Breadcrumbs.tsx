 import { ChevronRight, Home } from 'lucide-react';
 import { useMemo } from 'react';
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
   const pathname = location.pathname;
 
   // Don't show on home or dashboard
   if (pathname === '/' || pathname === '/dashboard') return null;
 
   const segments = pathname.split('/').filter(Boolean);
   
   // Enhanced breadcrumb building with dynamic support
   const crumbs = useMemo(() => {
     const items: { label: string; href?: string }[] = [{ label: 'Início', href: '/' }];
     let accumulatedPath = '';
 
     segments.forEach((segment, i) => {
       accumulatedPath += `/${segment}`;
       const isLast = i === segments.length - 1;
       
       // Priority for label: 
       // 1. Explicit routeLabels
       // 2. Section labels (admin, etc)
       // 3. Dynamic context (if it's a UUID/ID, we might want to mask it or get from state)
       let label = routeLabels[accumulatedPath] || sectionLabels[segment] || segment;
       
       // Basic ID detection and masking
       if (segment.length > 20 && !routeLabels[accumulatedPath]) {
         label = 'Detalhes'; // Generic label for UUIDs
       }
 
       items.push({
         label,
         href: isLast ? undefined : accumulatedPath,
       });
     });
     return items;
   }, [pathname]);
 
   if (crumbs.length <= 1) return null;
 
   const container = {
     hidden: { opacity: 0, y: -10 },
     show: {
       opacity: 1,
       y: 0,
       transition: {
         staggerChildren: 0.1,
         delayChildren: 0.1
       }
     }
   };
 
   const item = {
     hidden: { opacity: 0, x: -5 },
     show: { opacity: 1, x: 0 }
   };
 
   return (
     <motion.nav
       variants={container}
       initial="hidden"
       animate="show"
       aria-label="Breadcrumb"
       className={cn('flex items-center gap-3 px-4 lg:px-6 py-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm border-b border-border/5 shadow-sm sticky top-16 z-30', className)}
     >
       <motion.div variants={item}>
         <BackButton size="sm" variant="ghost" className="hover:bg-primary/10 transition-colors" />
       </motion.div>
       
       <div className="h-4 w-[1px] bg-border/20 mx-1 shrink-0" />
 
       <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 pr-4">
         {crumbs.map((crumb, i) => (
           <motion.span 
             key={i} 
             variants={item}
             className="flex items-center gap-1.5 group/crumb whitespace-nowrap"
           >
             {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30 group-hover/crumb:text-primary/50 transition-colors" />}
             {i === 0 ? (
               <Link 
                 to="/" 
                 onClick={() => haptics.selection()}
                 className="p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-all active:scale-90 group/home"
                 title="Página Inicial"
               >
                 <Home className="h-3.5 w-3.5 group-hover/home:scale-110 transition-transform" />
               </Link>
             ) : crumb.href ? (
               <Link 
                 to={crumb.href} 
                 onClick={() => haptics.selection()}
                 className="px-2 py-1 rounded-md hover:bg-primary/10 hover:text-primary transition-all font-medium active:scale-95 text-xs relative overflow-hidden"
               >
                 {crumb.label}
                 <motion.div 
                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20" 
                   initial={{ scaleX: 0 }}
                   whileHover={{ scaleX: 1 }}
                 />
               </Link>
             ) : (
               <span className="px-2.5 py-1 text-xs font-bold text-foreground bg-primary/5 rounded-md shadow-sm border border-primary/10 backdrop-blur-md">
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
