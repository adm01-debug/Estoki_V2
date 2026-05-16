 import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Package, Search, FileX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
 import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: 'default' | 'search' | 'error' | 'no-data';
  className?: string;
}

const variantIcons = { default: Inbox, search: Search, error: FileX, 'no-data': Package };

 export function EmptyState({ icon, title, description, action, variant = 'default', className }: EmptyStateProps) {
   const Icon = icon || variantIcons[variant];
   return (
     <motion.div 
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       className={cn('flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl border border-dashed border-border/50 bg-muted/5', className)}
     >
       <div className="relative mb-6">
         <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
         <div className="relative rounded-2xl bg-card border border-border shadow-sm p-5">
           <Icon className="h-10 w-10 text-primary/60" />
         </div>
       </div>
       <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
       {description && <p className="text-sm text-muted-foreground max-w-[280px] mb-6 leading-relaxed">{description}</p>}
       {action && (
         <Button 
           onClick={action.onClick} 
           variant="outline" 
           className="rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-all px-6"
         >
           {action.label}
         </Button>
       )}
     </motion.div>
   );
 }
export default EmptyState;
