import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Database } from "@/integrations/supabase/types";

type ConfigRow = Database["public"]["Tables"]["alertas_config"]["Row"];

export interface ConfigAlerta {
  id: string;
  tipo: ConfigRow["tipo"];
  descricao: string | null;
  threshold_valor: number | null;
  threshold_dias: number | null;
  severidade: ConfigRow["severidade"];
  ativo: boolean;
}

export type AlteracaoAlerta = Partial<
  Pick<ConfigRow, "ativo" | "threshold_valor" | "threshold_dias" | "severidade">
>;

const SEVERIDADES: { valor: ConfigRow["severidade"]; rotulo: string }[] = [
  { valor: "info", rotulo: "Informativo" },
  { valor: "aviso", rotulo: "Aviso" },
  { valor: "critico", rotulo: "Crítico" },
  { valor: "urgente", rotulo: "Urgente" },
];

const VARIANTE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  urgente: "destructive",
  critico: "destructive",
  aviso: "default",
  info: "secondary",
};

interface Props {
  configAlertas: ConfigAlerta[];
  podeEditar?: boolean;
  onSalvar?: (
    tipo: ConfigAlerta["tipo"],
    alteracao: AlteracaoAlerta
  ) => Promise<boolean> | boolean | void;
}

function LinhaConfig({
  config,
  podeEditar,
  onSalvar,
}: {
  config: ConfigAlerta;
  podeEditar: boolean;
  onSalvar?: Props["onSalvar"];
}) {
  const usaDias = config.threshold_dias != null;
  const original = usaDias ? config.threshold_dias : config.threshold_valor;
  const [valor, setValor] = useState(original == null ? "" : String(original));
  const [severidade, setSeveridade] = useState(config.severidade);
  const [salvando, setSalvando] = useState(false);
  const alterado =
    valor.trim() !== (original == null ? "" : String(original)) || severidade !== config.severidade;

  const salvar = async (alteracao: AlteracaoAlerta) => {
    if (!onSalvar) return;
    setSalvando(true);
    try {
      await onSalvar(config.tipo, alteracao);
    } finally {
      setSalvando(false);
    }
  };

  const salvarFormulario = async () => {
    const alteracao: AlteracaoAlerta = {};
    if (severidade !== config.severidade) alteracao.severidade = severidade;

    const numero = valor.trim() === "" ? null : Number(valor);
    if (numero !== null && !Number.isFinite(numero)) return;
    if (usaDias && numero !== config.threshold_dias) alteracao.threshold_dias = numero;
    if (!usaDias && numero !== config.threshold_valor) alteracao.threshold_valor = numero;

    if (Object.keys(alteracao).length === 0) return;
    await salvar(alteracao);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{config.tipo}</TableCell>
      <TableCell className="hidden md:table-cell">{config.descricao}</TableCell>
      <TableCell>
        {config.threshold_valor == null && config.threshold_dias == null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              aria-label={`Limiar de ${config.tipo}`}
              className="h-8 w-24"
              disabled={!podeEditar || salvando}
              min={0}
              onChange={(e) => setValor(e.target.value)}
              type="number"
              value={valor}
            />
            <span className="text-xs text-muted-foreground">{usaDias ? "dias" : "un."}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {podeEditar ? (
          <Select
            onValueChange={(v) => setSeveridade(v as ConfigRow["severidade"])}
            value={severidade}
          >
            <SelectTrigger aria-label={`Severidade de ${config.tipo}`} className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERIDADES.map((s) => (
                <SelectItem key={s.valor} value={s.valor}>
                  {s.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={VARIANTE[config.severidade] || "secondary"}>{config.severidade}</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            aria-label={`Ativar ${config.tipo}`}
            checked={config.ativo}
            disabled={!podeEditar || salvando}
            onCheckedChange={(v) => salvar({ ativo: v })}
          />
          <Label className="text-xs text-muted-foreground">
            {config.ativo ? "Ativo" : "Inativo"}
          </Label>
        </div>
      </TableCell>
      {podeEditar && (
        <TableCell className="text-right">
          <Button
            disabled={!alterado || salvando}
            onClick={salvarFormulario}
            size="sm"
            variant="outline"
          >
            Salvar
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

export function AlertasConfigTable({ configAlertas, podeEditar = false, onSalvar }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Alertas</CardTitle>
        <CardDescription>
          {podeEditar
            ? "Ligue, desligue e ajuste o limiar e a severidade de cada tipo de alerta. A geração de alertas usa exatamente estes valores."
            : "Somente administradores podem alterar estas configurações."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {configAlertas.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma configuração encontrada. Rode a migration de configuração de alertas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead>Limiar</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Ativo</TableHead>
                  {podeEditar && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {configAlertas.map((config) => (
                  <LinhaConfig
                    key={`${config.id}-${config.ativo}-${config.threshold_valor}-${config.threshold_dias}-${config.severidade}`}
                    config={config}
                    podeEditar={podeEditar}
                    onSalvar={onSalvar}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
