import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, AlertTriangle, Clock, Volume2 } from "lucide-react";

export interface ConfiguracaoAlertas {
  diasParadoAlerta: number;
  diasParadoCritico: number;
  estoqueMinimoPadrao: number;
  alertaSonoro: boolean;
  alertaVibrar: boolean;
  notificacaoPush: boolean;
}

interface Props {
  alertas: ConfiguracaoAlertas;
  onChange: (updates: Partial<ConfiguracaoAlertas>) => void;
}

export function AlertasConfigCard({ alertas, onChange }: Props) {
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
              <Clock className="h-4 w-4 text-warning" />Dias para Alerta
            </Label>
            <Input type="number" value={alertas.diasParadoAlerta} onChange={(e) => onChange({ diasParadoAlerta: Number(e.target.value) })} min={1} max={90} />
            <p className="text-xs text-muted-foreground">Item parado gera alerta amarelo</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />Dias para Crítico
            </Label>
            <Input type="number" value={alertas.diasParadoCritico} onChange={(e) => onChange({ diasParadoCritico: Number(e.target.value) })} min={1} max={120} />
            <p className="text-xs text-muted-foreground">Item parado gera alerta vermelho</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Estoque Mínimo Padrão</Label>
          <Input type="number" value={alertas.estoqueMinimoPadrao} onChange={(e) => onChange({ estoqueMinimoPadrao: Number(e.target.value) })} min={0} />
          <p className="text-xs text-muted-foreground">Quantidade mínima padrão para novos produtos</p>
        </div>
        <Separator />
        <div className="space-y-3">
          <Label className="text-sm font-medium">Notificações</Label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Alerta Sonoro</span></div>
            <Switch checked={alertas.alertaSonoro} onCheckedChange={(c) => onChange({ alertaSonoro: c })} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Vibrar ao Escanear</span></div>
            <Switch checked={alertas.alertaVibrar} onCheckedChange={(c) => onChange({ alertaVibrar: c })} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Notificações Push</span></div>
            <Switch checked={alertas.notificacaoPush} onCheckedChange={(c) => onChange({ notificacaoPush: c })} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
