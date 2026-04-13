import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

export function InventarioConfigTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" />Configurações do Inventário
        </CardTitle>
        <CardDescription>Defina metas e frequências de contagem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Meta de Acuracidade (%)</Label>
            <Input type="number" defaultValue={99} min={90} max={100} />
          </div>
          <div className="space-y-2">
            <Label>Threshold de Divergência (%)</Label>
            <Input type="number" defaultValue={5} min={1} max={20} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Frequência Curva A (dias)</Label><Input type="number" defaultValue={7} min={1} /></div>
          <div className="space-y-2"><Label>Frequência Curva B (dias)</Label><Input type="number" defaultValue={14} min={1} /></div>
          <div className="space-y-2"><Label>Frequência Curva C (dias)</Label><Input type="number" defaultValue={30} min={1} /></div>
        </div>
        <Button className="mt-4">Salvar Configurações</Button>
      </CardContent>
    </Card>
  );
}
