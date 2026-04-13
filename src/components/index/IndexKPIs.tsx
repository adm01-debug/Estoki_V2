import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/dashboard/KPICard";

interface KPIItem {
  icon: LucideIcon;
  value: number | string;
  label: string;
  sublabel: string;
  variant: "warning" | "default" | "success" | "danger";
  path: string;
}

interface IndexKPIsProps {
  items: KPIItem[];
  loading: boolean;
  onNavigate: (path: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function IndexKPIs({ items, loading, onNavigate }: IndexKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
      ) : (
        items.map((kpi) => (
          <motion.div key={kpi.label} variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <KPICard
              icon={kpi.icon}
              value={kpi.value}
              label={kpi.label}
              sublabel={kpi.sublabel}
              variant={kpi.variant}
              onClick={() => onNavigate(kpi.path)}
            />
          </motion.div>
        ))
      )}
    </div>
  );
}
