import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
}

export function KPICard({ label, value, icon: Icon, color, subtitle }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {label}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
              {subtitle && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
