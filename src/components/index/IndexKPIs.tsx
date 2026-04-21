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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.08 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className="cursor-pointer"
          onClick={() => onNavigate(item.path)}
        >
          <Card className="glass-card border-border/30 h-full">
            <CardContent className="p-4 md:p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${variantStyles[item.variant]} mb-3`}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-foreground">{item.value}</p>
              <p className="text-sm font-semibold text-foreground mt-1">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sublabel}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
