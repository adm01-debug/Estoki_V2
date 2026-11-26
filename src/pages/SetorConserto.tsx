import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/common/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRecuperacaoMateriais } from "@/hooks/useRecuperacaoMateriais";
import {
  STATUS_CONSERTO,
  validarResultado,
  type RecuperacaoComLote,
  type StatusConserto,
} from "@/features/quality/services/consertoService";
import { Hammer, Loader2, PackageCheck, RotateCcw, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

const ROTULO_STATUS: Record<StatusConserto, string> = {
  em_recuperacao: "Em recuperação",
  recuperado: "Recuperado",
  sucata: "Sucata",
};

const COR_STATUS: Record<StatusConserto, string> = {
  em_recuperacao: "bg-warning/15 text-warning border-warning/30",
  recuperado: "bg-success/15 text-success border-success/30",
  sucata: "bg-destructive/15 text-destructive border-destructive/30",
};

const FILTROS = ["todas", ...STATUS_CONSERTO] as const;
type Filtro = (typeof FILTROS)[number];

const ROTULO_FILTRO: Record<Filtro, string> = {
  todas: "Todas",
  em_recuperacao: "Em recuperação",
  recuperado: "Recuperado",
  sucata: "Sucata",
};

function statusValido(status: string | null): StatusConserto {
  return STATUS_CONSERTO.includes(status as StatusConserto)
    ? (status as StatusConserto)
    : "em_recuperacao";
}

export default function SetorConsertoPage() {
  const { recuperacoes, isLoading, error, refetch, registrarResultado } = useRecuperacaoMateriais();

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [selecionada, setSelecionada] = useState<RecuperacaoComLote | null>(null);
  const [recuperada, setRecuperada] = useState("0");
  const [perda, setPerda] = useState("0");
  const [status, setStatus] = useState<"recuperado" | "sucata">("recuperado");
  const [observacoes, setObservacoes] = useState("");
  const [erroForm, setErroForm] = useState<string | null>(null);

  const lista = useMemo(
    () => recuperacoes.filter((r) => filtro === "todas" || statusValido(r.status) === filtro),
    [recuperacoes, filtro]
  );

  const kpis = useMemo(() => {
    const abertas = recuperacoes.filter((r) => statusValido(r.status) === "em_recuperacao");
    const soma = (fn: (r: RecuperacaoComLote) => number) =>
      recuperacoes.reduce((acc, r) => acc + fn(r), 0);
    const recuperadas = soma((r) => r.quantidade_recuperada ?? 0);
    const perdas = soma((r) => r.quantidade_perda ?? 0);
    const total = soma((r) => r.quantidade_original);
    return {
      abertas: abertas.length,
      aguardando: abertas.reduce(
        (acc, r) =>
          acc +
          (r.quantidade_original - (r.quantidade_recuperada ?? 0) - (r.quantidade_perda ?? 0)),
        0
      ),
      recuperadas,
      perdas,
      taxa: total > 0 ? Math.round((recuperadas / total) * 100) : 0,
    };
  }, [recuperacoes]);

  function abrirDialogo(item: RecuperacaoComLote) {
    setSelecionada(item);
    setRecuperada("0");
    setPerda(String(item.quantidade_original));
    setStatus("recuperado");
    setObservacoes("");
    setErroForm(null);
  }

  async function enviar() {
    if (!selecionada) return;

    const resultado = {
      recuperada: Number(recuperada),
      perda: Number(perda),
      status,
      observacoes: observacoes.trim() || undefined,
    };

    const invalido = validarResultado(selecionada.quantidade_original, resultado);
    if (invalido) {
      setErroForm(invalido);
      return;
    }

    try {
      await registrarResultado.mutateAsync({ id: selecionada.id, resultado });
      toast.success("Recuperação encerrada", {
        description: `${resultado.recuperada} recuperada(s), ${resultado.perda} perdida(s).`,
      });
      setSelecionada(null);
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : "Não foi possível gravar o resultado";
      setErroForm(mensagem);
      toast.error("Erro ao encerrar recuperação", { description: mensagem });
    }
  }

  return (
    <AppLayout title="Setor de Conserto">
      <SEO
        title="Setor de Conserto"
        description="Recuperação de materiais retidos na triagem"
        path="/setor-conserto"
      />
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Wrench className="h-8 w-8 text-warning" />
              <div>
                <p className="text-xs text-muted-foreground">Lotes no setor</p>
                <p className="text-2xl font-bold">{kpis.abertas}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Hammer className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Unidades aguardando</p>
                <p className="text-2xl font-bold">{kpis.aguardando}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <PackageCheck className="h-8 w-8 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Unidades recuperadas</p>
                <p className="text-2xl font-bold">{kpis.recuperadas}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Trash2 className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Perdas / taxa de recuperação</p>
                <p className="text-2xl font-bold">
                  {kpis.perdas}{" "}
                  <span className="text-sm font-medium text-muted-foreground">({kpis.taxa}%)</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filtro === f ? "default" : "outline"}
              onClick={() => setFiltro(f)}
            >
              {ROTULO_FILTRO[f]}
            </Button>
          ))}
          <Button size="sm" variant="ghost" className="gap-2" onClick={() => void refetch()}>
            <RotateCcw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Materiais em recuperação</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <p className="p-4 text-sm text-destructive">Erro ao carregar: {error}</p>
            ) : lista.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <Hammer className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  Nenhuma recuperação {filtro === "todas" ? "" : `em "${ROTULO_FILTRO[filtro]}"`}
                </p>
                <p className="max-w-md text-xs text-muted-foreground">
                  As unidades em conserto aparecem aqui quando a triagem de um lote é reprovada com
                  quantidade para retrabalho.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Entrou</TableHead>
                    <TableHead className="text-right">Recuperado</TableHead>
                    <TableHead className="text-right">Perda</TableHead>
                    <TableHead>Defeito</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((r) => {
                    const st = statusValido(r.status);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">
                          {r.lotes?.numero_lote ?? "—"}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{r.lotes?.produtos?.nome ?? "—"}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {r.lotes?.produtos?.sku ?? ""}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">{r.quantidade_original}</TableCell>
                        <TableCell className="text-right">{r.quantidade_recuperada ?? 0}</TableCell>
                        <TableCell className="text-right">{r.quantidade_perda ?? 0}</TableCell>
                        <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                          {r.defeito_identificado ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={COR_STATUS[st]}>
                            {ROTULO_STATUS[st]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={st !== "em_recuperacao"}
                            onClick={() => abrirDialogo(r)}
                          >
                            Encerrar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selecionada} onOpenChange={(aberto) => !aberto && setSelecionada(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar recuperação</DialogTitle>
            <DialogDescription>
              {selecionada
                ? `${selecionada.quantidade_original} unidade(s) entraram no setor. Informe o que voltou ao estoque e o que virou perda.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="recuperada">Recuperadas</Label>
                <Input
                  id="recuperada"
                  type="number"
                  min={0}
                  value={recuperada}
                  onChange={(e) => setRecuperada(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="perda">Perdidas</Label>
                <Input
                  id="perda"
                  type="number"
                  min={0}
                  value={perda}
                  onChange={(e) => setPerda(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="status-conserto">Destino</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v === "sucata" ? "sucata" : "recuperado")}
              >
                <SelectTrigger id="status-conserto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recuperado">Volta ao estoque</SelectItem>
                  <SelectItem value="sucata">Sucata (perda total)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-conserto">Observações</Label>
              <Textarea
                id="obs-conserto"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>

            {erroForm && <p className="text-xs font-medium text-destructive">{erroForm}</p>}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelecionada(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void enviar()} disabled={registrarResultado.isPending}>
              {registrarResultado.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gravar resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
