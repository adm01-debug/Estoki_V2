import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AlertIndicatorProps {
  criticalCount: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  alertsEnabled: boolean;
  onAlertsToggle: () => void;
}

export function AlertIndicator({
  criticalCount,
  soundEnabled,
  onSoundToggle,
  alertsEnabled,
  onAlertsToggle,
}: AlertIndicatorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative ${criticalCount > 0 ? "border-destructive text-destructive" : ""}`}
        >
          <AnimatePresence mode="wait">
            {criticalCount > 0 ? (
              <motion.div
                key="alert"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <AlertTriangle className="h-4 w-4" />
                </motion.div>
                <span>{criticalCount} Alerta{criticalCount > 1 ? "s" : ""}</span>
              </motion.div>
            ) : (
              <motion.div
                key="normal"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span>Alertas</span>
              </motion.div>
            )}
          </AnimatePresence>

          {criticalCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
            >
              {criticalCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Configurações de Alertas</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Gerencie notificações visuais e sonoras
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {alertsEnabled ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="alerts-toggle" className="text-sm">
                  Alertas Visuais
                </Label>
              </div>
              <Switch
                id="alerts-toggle"
                checked={alertsEnabled}
                onCheckedChange={onAlertsToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound-toggle" className="text-sm">
                  Alertas Sonoros
                </Label>
              </div>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={onSoundToggle}
              />
            </div>
          </div>

          {criticalCount > 0 && (
            <div className="rounded-md bg-destructive/10 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    {criticalCount} KPI{criticalCount > 1 ? "s" : ""} crítico{criticalCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verifique os indicadores abaixo da meta
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground">
              <strong>Níveis de alerta:</strong>
              <br />• ⚠️ Atenção: 10-20% fora da meta
              <br />• 🚨 Crítico: mais de 20% fora da meta
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
