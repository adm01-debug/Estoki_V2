import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

export function InventarioConfigTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" />
          Configurações do Inventário
        </CardTitle>
        <CardDescription>Defina metas e frequências de contagem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meta-de-acuracidade">Meta de Acuracidade (%)</Label>
            <Input id="meta-de-acuracidade" type="number" defaultValue={99} min={90} max={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold-de-divergencia">Threshold de Divergência (%)</Label>
            <Input id="threshold-de-divergencia" type="number" defaultValue={5} min={1} max={20} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="frequencia-curva-a-dias">Frequência Curva A (dias)</Label>
            <Input id="frequencia-curva-a-dias" type="number" defaultValue={7} min={1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequencia-curva-b-dias">Frequência Curva B (dias)</Label>
            <Input id="frequencia-curva-b-dias" type="number" defaultValue={14} min={1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequencia-curva-c-dias">Frequência Curva C (dias)</Label>
            <Input id="frequencia-curva-c-dias" type="number" defaultValue={30} min={1} />
          </div>
        </div>
        <Button className="mt-4">Salvar Configurações</Button>
      </CardContent>
    </Card>
  );
}
