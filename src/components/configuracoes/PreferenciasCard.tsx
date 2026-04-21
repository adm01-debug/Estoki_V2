import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Palette } from "lucide-react";

export interface PreferenciasUsuario {
  nome: string;
  tema: "light" | "dark" | "system";
  idioma: string;
  formatoData: string;
  paginacaoPadrao: number;
  exibirValores: boolean;
}

interface Props {
  preferencias: PreferenciasUsuario;
  theme: string | null | undefined;
  onChange: (updates: Partial<PreferenciasUsuario>) => void;
  onThemeChange: (v: "light" | "dark" | "system") => void;
}

export function PreferenciasCard({ preferencias, theme, onChange, onThemeChange }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Preferências do Usuário
        </CardTitle>
        <CardDescription>Personalize sua experiência no sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Nome do Operador</Label>
          <Input value={preferencias.nome} onChange={(e) => onChange({ nome: e.target.value })} placeholder="Seu nome" maxLength={50} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2"><Palette className="h-4 w-4" />Tema</Label>
            <Select value={theme || "system"} onValueChange={(v: "light" | "dark" | "system") => onThemeChange(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Formato de Data</Label>
            <Select value={preferencias.formatoData} onValueChange={(v) => onChange({ formatoData: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Itens por Página</Label>
          <Select value={preferencias.paginacaoPadrao.toString()} onValueChange={(v) => onChange({ paginacaoPadrao: Number(v) })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 itens</SelectItem>
              <SelectItem value="20">20 itens</SelectItem>
              <SelectItem value="50">50 itens</SelectItem>
              <SelectItem value="100">100 itens</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">Exibir Valores</span>
            <p className="text-xs text-muted-foreground">Mostrar valores monetários nas telas</p>
          </div>
          <Switch checked={preferencias.exibirValores} onCheckedChange={(c) => onChange({ exibirValores: c })} />
        </div>
      </CardContent>
    </Card>
  );
}
