import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Clock, AlertTriangle, Volume2 } from "lucide-react";

export interface ConfiguracaoAlertas {
  diasParadoAlerta: number;
  diasParadoCritico: number;
  estoqueMinimoPadrao: number;
  alertaSonoro: boolean;
  alertaVibrar: boolean;
  notificacaoPush: boolean;
}

interface AlertasConfigCardProps {
  alertas: ConfiguracaoAlertas;
  onUpdate: (updates: Partial<ConfiguracaoAlertas>) => void;
}

export function AlertasConfigCard({ alertas, onUpdate }: AlertasConfigCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Parâmetros de Alertas
        </CardTitle>
        <CardDescription>Configure quando e como receber alertas do sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />Dias para Alerta
            </Label>
            <Input type="number" value={alertas.diasParadoAlerta} onChange={(e) => onUpdate({ diasParadoAlerta: Number(e.target.value) })} min={1} max={90} />
            <p className="text-xs text-muted-foreground">Item parado gera alerta amarelo</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />Dias para Crítico
            </Label>
            <Input type="number" value={alertas.diasParadoCritico} onChange={(e) => onUpdate({ diasParadoCritico: Number(e.target.value) })} min={1} max={120} />
            <p className="text-xs text-muted-foreground">Item parado gera alerta vermelho</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Estoque Mínimo Padrão</Label>
          <Input type="number" value={alertas.estoqueMinimoPadrao} onChange={(e) => onUpdate({ estoqueMinimoPadrao: Number(e.target.value) })} min={0} />
          <p className="text-xs text-muted-foreground">Quantidade mínima padrão para novos produtos</p>
        </div>
        <Separator />
        <div className="space-y-3">
          <Label className="text-sm font-medium">Notificações</Label>
          {[
            { icon: Volume2, label: "Alerta Sonoro", key: "alertaSonoro" as const },
            { icon: Bell, label: "Vibrar ao Escanear", key: "alertaVibrar" as const },
            { icon: Bell, label: "Notificações Push", key: "notificacaoPush" as const },
          ].map(({ icon: Icon, label, key }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{label}</span></div>
              <Switch checked={alertas[key]} onCheckedChange={(checked) => onUpdate({ [key]: checked })} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
