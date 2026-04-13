import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Weight, TrendingUp } from "lucide-react";

type Rotatividade = "alta" | "media" | "baixa";

interface ItemArmazenar {
  id: string; sku: string; descricao: string; peso: number; rotatividade: Rotatividade; quantidade: number; volumes: number; produtoId?: string; loteId?: string;
}

interface ArmazenamentoItemCardProps {
  item: ItemArmazenar;
  onItemChange: (item: ItemArmazenar) => void;
}

const getRotatividadeColor = (rot: Rotatividade) => {
  switch (rot) {
    case "alta": return "bg-red-500/20 text-red-700 border-red-500/30";
    case "media": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    case "baixa": return "bg-green-500/20 text-green-700 border-green-500/30";
  }
};

const getPesoIcon = (peso: number) => peso <= 10 ? "🪶" : peso <= 30 ? "📦" : "🏋️";

export function ArmazenamentoItemCard({ item, onItemChange }: ArmazenamentoItemCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />Item a Armazenar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{item.sku || "SKU não informado"}</p>
            <p className="text-sm text-muted-foreground">{item.descricao}</p>
          </div>
          <Badge variant="outline">{item.volumes} volume(s)</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Peso por Volume</Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={item.peso} onChange={e => onItemChange({ ...item, peso: Number(e.target.value) })} className="h-9" />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Rotatividade</Label>
            <Select value={item.rotatividade} onValueChange={(v: Rotatividade) => onItemChange({ ...item, rotatividade: v })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Alta (Curva A)</SelectItem>
                <SelectItem value="media">Média (Curva B)</SelectItem>
                <SelectItem value="baixa">Baixa (Curva C)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Badge variant="outline" className="gap-1"><Weight className="h-3 w-3" />{getPesoIcon(item.peso)} {item.peso}kg</Badge>
          <Badge variant="outline" className={getRotatividadeColor(item.rotatividade)}><TrendingUp className="h-3 w-3 mr-1" />Rotatividade {item.rotatividade}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
