import { useEffect, useState } from "react";
import { Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useInventarioConfig,
  type InventarioConfig,
  type InventarioConfigEditavel,
} from "@/hooks/useInventarioConfig";

type Campo = {
  chave: keyof InventarioConfigEditavel;
  id: string;
  rotulo: string;
  min: number;
  max?: number;
};

const CAMPOS: Campo[] = [
  {
    chave: "meta_acuracidade",
    id: "meta-de-acuracidade",
    rotulo: "Meta de Acuracidade (%)",
    min: 90,
    max: 100,
  },
  {
    chave: "threshold_divergencia",
    id: "threshold-de-divergencia",
    rotulo: "Threshold de Divergência (%)",
    min: 1,
    max: 20,
  },
  {
    chave: "frequencia_zona_a",
    id: "frequencia-curva-a-dias",
    rotulo: "Frequência Curva A (dias)",
    min: 1,
  },
  {
    chave: "frequencia_zona_b",
    id: "frequencia-curva-b-dias",
    rotulo: "Frequência Curva B (dias)",
    min: 1,
  },
  {
    chave: "frequencia_zona_c",
    id: "frequencia-curva-c-dias",
    rotulo: "Frequência Curva C (dias)",
    min: 1,
  },
];

type Formulario = Record<keyof InventarioConfigEditavel, string>;

const paraFormulario = (config: InventarioConfig): Formulario => ({
  meta_acuracidade: String(config.meta_acuracidade),
  threshold_divergencia: String(config.threshold_divergencia),
  frequencia_zona_a: String(config.frequencia_zona_a),
  frequencia_zona_b: String(config.frequencia_zona_b),
  frequencia_zona_c: String(config.frequencia_zona_c),
});

const validar = (form: Formulario): InventarioConfigEditavel | string => {
  const convertido: Partial<InventarioConfigEditavel> = {};
  for (const campo of CAMPOS) {
    const valor = Number(form[campo.chave]);
    if (
      !Number.isFinite(valor) ||
      valor < campo.min ||
      (campo.max !== undefined && valor > campo.max)
    ) {
      return `${campo.rotulo} precisa estar entre ${campo.min} e ${campo.max ?? "sem limite"}.`;
    }
    convertido[campo.chave] = valor;
  }
  return convertido as InventarioConfigEditavel;
};

export function InventarioConfigTab() {
  const { config, carregando, erro, podeEditar, salvando, salvar } = useInventarioConfig();
  const { toast } = useToast();
  const [form, setForm] = useState<Formulario>(() => paraFormulario(config));

  useEffect(() => {
    setForm(paraFormulario(config));
  }, [config]);

  const alterado = CAMPOS.some(
    (campo) => form[campo.chave] !== paraFormulario(config)[campo.chave]
  );

  const enviar = async () => {
    const dados = validar(form);
    if (typeof dados === "string") {
      toast({ title: "Configuração inválida", description: dados, variant: "destructive" });
      return;
    }
    try {
      await salvar(dados);
      toast({
        title: "Configurações salvas",
        description: "As regras do inventário já valem para as próximas contagens.",
      });
    } catch (falha) {
      toast({
        title: "Erro ao salvar",
        description: falha instanceof Error ? falha.message : String(falha),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" />
          Configurações do Inventário
        </CardTitle>
        <CardDescription>
          Defina metas, tolerância de divergência e frequências de contagem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {carregando ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando configurações...
          </p>
        ) : null}
        {erro ? (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        ) : null}
        {!podeEditar ? (
          <p className="text-sm text-muted-foreground">
            Somente administradores podem alterar estas configurações.
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {CAMPOS.slice(0, 2).map((campo) => (
            <div key={campo.id} className="space-y-2">
              <Label htmlFor={campo.id}>{campo.rotulo}</Label>
              <Input
                id={campo.id}
                type="number"
                min={campo.min}
                max={campo.max}
                disabled={!podeEditar || salvando}
                value={form[campo.chave]}
                onChange={(evento) =>
                  setForm((atual) => ({ ...atual, [campo.chave]: evento.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CAMPOS.slice(2).map((campo) => (
            <div key={campo.id} className="space-y-2">
              <Label htmlFor={campo.id}>{campo.rotulo}</Label>
              <Input
                id={campo.id}
                type="number"
                min={campo.min}
                disabled={!podeEditar || salvando}
                value={form[campo.chave]}
                onChange={(evento) =>
                  setForm((atual) => ({ ...atual, [campo.chave]: evento.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={enviar} disabled={!podeEditar || salvando || !alterado}>
          {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}
