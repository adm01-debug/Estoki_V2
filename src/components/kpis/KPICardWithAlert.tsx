import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, ArrowUp, ArrowDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardWithAlertProps {
  title: string;
  value: number;
  meta: number;
  unit?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  invertido?: boolean; // true if lower is better
  tendencia?: number;
  subtitle?: string;
  showProgress?: boolean;
  isCritical?: boolean;
}

export function KPICardWithAlert({
  title,
  value,
  meta,
  unit = "%",
  icon: Icon,
  iconColor,
  iconBgColor,
  invertido = false,
  tendencia,
  subtitle,
  showProgress = true,
  isCritical = false,
}: KPICardWithAlertProps) {
  // Determine status
  const isGood = invertido ? value <= meta : value >= meta;
  const percentageDiff = meta > 0 
    ? (invertido 
        ? ((value - meta) / meta) * 100 
        : ((meta - value) / meta) * 100)
    : 0;
  const alertLevel = percentageDiff > 20 ? "critical" : percentageDiff > 10 ? "warning" : "ok";

  return (
    <motion.div
      animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Card
        className={cn(
          "transition-all duration-300",
          isCritical && "ring-2 ring-destructive ring-offset-2 ring-offset-background"
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{title}</p>
                {isCritical && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </motion.div>
                )}
              </div>
              <p className="text-3xl font-bold">
                {value.toFixed(1)}{unit}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  Meta: {meta}{unit}
                </span>
                {isGood ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : alertLevel === "critical" ? (
                  <XCircle className="h-3 w-3 text-destructive" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
                {tendencia !== undefined && tendencia !== 0 && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      invertido
                        ? tendencia < 0 ? "text-green-500" : "text-destructive"
                        : tendencia > 0 ? "text-green-500" : "text-destructive"
                    )}
                  >
                    {tendencia > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(tendencia).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
            <motion.div 
              className={cn("rounded-full p-3", iconBgColor)}
              animate={isCritical ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1, repeatDelay: 2 }}
            >
              <Icon className={cn("h-6 w-6", iconColor)} />
            </motion.div>
          </div>
          {showProgress && (
            <Progress
              value={Math.min(value, 100)}
              className={cn(
                "mt-4 h-2",
                isCritical && "[&>div]:bg-destructive"
              )}
            />
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
