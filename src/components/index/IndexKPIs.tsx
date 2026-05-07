import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface KPIItem {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel: string;
  variant: "default" | "warning" | "success" | "danger";
  path: string;
}

const variantStyles = {
  default: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Props {
  items: KPIItem[];
  loading: boolean;
  onNavigate: (path: string) => void;
}

export function IndexKPIs({ items, loading, onNavigate }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="cursor-pointer group"
          onClick={() => onNavigate(item.path)}
        >
          <div className="kpi-card group-hover:translate-y-[-4px]">
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="kpi-card-icon">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-3xl md:text-4xl font-black text-foreground tracking-tighter leading-none">{item.value}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground tracking-tight">{item.label}</p>
                <p className="text-overline mt-1">{item.sublabel}</p>
              </div>
            </div>
            
            {/* Visual indicator for the variant */}
            <div className={cn(
              "absolute bottom-0 left-0 h-1 transition-all duration-500",
              item.variant === 'warning' && "bg-warning w-1/3 group-hover:w-full",
              item.variant === 'success' && "bg-success w-1/3 group-hover:w-full",
              item.variant === 'danger' && "bg-destructive w-1/3 group-hover:w-full",
              item.variant === 'default' && "bg-primary w-1/3 group-hover:w-full"
            )} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
}
