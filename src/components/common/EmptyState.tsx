 import { ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Search, Warehouse, FileText, ClipboardList, ArrowRight, type LucideIcon } from "lucide-react";
 import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "compact";
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className,
  children,
}: EmptyStateProps) {
  const isCompact = variant === "compact";

   return (
     <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.95 }}
       transition={{ duration: 0.5, ease: "easeOut" }}
       className={cn(
         "flex flex-col items-center justify-center text-center",
         isCompact ? "py-8 px-4" : "py-16 px-6",
         className
       )}
     >
       {/* Icon with ambient glow */}
       <div className="relative mb-6">
         <motion.div 
           initial={{ scale: 0.8, rotate: -10 }}
           animate={{ scale: 1, rotate: 0 }}
           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
           className={cn(
             "rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center relative z-10 overflow-hidden group",
             isCompact ? "w-16 h-16" : "w-24 h-24"
           )}
         >
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <Icon className={cn(
             "text-primary/40 group-hover:text-primary/60 transition-colors duration-300",
             isCompact ? "h-8 w-8" : "h-12 w-12"
           )} />
         </motion.div>
         <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.3, 0.5, 0.3]
           }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -inset-4 rounded-[40px] bg-primary/10 blur-2xl pointer-events-none z-0" 
         />
       </div>
 
       <motion.h3 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.3 }}
         className={cn(
           "font-black text-foreground mb-2 tracking-tight uppercase",
           isCompact ? "text-base" : "text-xl"
         )}
       >
         {title}
       </motion.h3>
 
       <motion.p 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.4 }}
         className={cn(
           "text-muted-foreground max-w-sm leading-relaxed font-medium",
           isCompact ? "text-xs" : "text-sm"
         )}
       >
         {description}
       </motion.p>
 
       {children && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="mt-4"
         >
           {children}
         </motion.div>
       )}
 
       <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
         className="flex items-center gap-4 mt-8"
       >
         {action && (
           <Button 
             onClick={action.onClick} 
             size={isCompact ? "sm" : "lg"} 
             className="gap-2 rounded-xl font-bold uppercase tracking-tighter px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
           >
             {action.icon ? <action.icon className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
             {action.label}
           </Button>
         )}
         {secondaryAction && (
           <Button 
             variant="ghost" 
             size={isCompact ? "sm" : "lg"} 
             onClick={secondaryAction.onClick}
             className="rounded-xl font-bold uppercase tracking-tighter hover:bg-primary/5 transition-all"
           >
             {secondaryAction.label}
           </Button>
         )}
       </motion.div>
     </motion.div>
   );
}

/** Pre-configured empty state props for common modules */
export const emptyStates = {
  produtos: {
    icon: Package,
    title: "Nenhum produto cadastrado",
    description: "Comece cadastrando seu primeiro produto para gerenciar o estoque.",
  },
  triagem: {
    icon: Search,
    title: "Nenhuma triagem pendente",
    description: "Todas as triagens foram concluídas. Novos lotes aparecerão aqui automaticamente.",
  },
  estoque: {
    icon: Warehouse,
    title: "Estoque vazio",
    description: "Cadastre produtos e receba materiais para começar a gerenciar posições.",
  },
  relatorios: {
    icon: FileText,
    title: "Nenhum relatório gerado",
    description: "Gere relatórios para analisar a performance do seu armazém.",
  },
  atividades: {
    icon: ClipboardList,
    title: "Sem atividade recente",
    description: "As operações realizadas aparecerão aqui em tempo real.",
  },
  busca: {
    icon: Search,
    title: "Nenhum resultado encontrado",
    description: "Tente ajustar os filtros ou termos de busca para encontrar o que procura.",
  },
} as const;
