import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, EyeOff, Flag, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { featureFlags } from "@/lib/featureFlags";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState } from "@/components/common/AsyncStates";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";

interface FeatureFlagRow {
  key: string;
  enabled: boolean;
  value: unknown;
  description: string | null;
  active: boolean;
  updated_at: string | null;
  updated_by: string | null;
}

const CHAVE_VALIDA = /^[a-z][a-z0-9._-]{2,63}$/;

export default function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const [novaChave, setNovaChave] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  const flagsQuery = useQuery({
    queryKey: ["feature-flags-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feature_flags").select("*").order("key");
      if (error) throw error;
      return (data ?? []) as FeatureFlagRow[];
    },
    staleTime: 30_000,
  });

  const flags = useMemo(() => flagsQuery.data ?? [], [flagsQuery.data]);

  const resumo = useMemo(() => {
    const ligadas = flags.filter((f) => f.active && f.enabled).length;
    const desligadas = flags.filter((f) => f.active && !f.enabled).length;
    const ocultas = flags.filter((f) => !f.active).length;
    return { total: flags.length, ligadas, desligadas, ocultas };
  }, [flags]);

  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ["feature-flags-admin"] });
    void featureFlags.reload();
  };

  const alternar = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { error } = await supabase.from("feature_flags").update({ enabled }).eq("key", key);
      if (error) throw error;
      return { key, enabled };
    },
    onSuccess: ({ key, enabled }) => {
      featureFlags.setFlag(key, enabled);
      toast.success(`"${key}" ${enabled ? "ligada" : "desligada"}.`);
      void queryClient.invalidateQueries({ queryKey: ["feature-flags-admin"] });
    },
    onError: (erro: Error) => toast.error(`Falha ao alterar a flag: ${erro.message}`),
  });

  const alternarVisibilidade = useMutation({
    mutationFn: async ({ key, active }: { key: string; active: boolean }) => {
      const { error } = await supabase.from("feature_flags").update({ active }).eq("key", key);
      if (error) throw error;
      return { key, active };
    },
    onSuccess: ({ key, active }) => {
      toast.success(
        active ? `"${key}" voltou a aparecer no app.` : `"${key}" foi ocultada do app.`
      );
      recarregar();
    },
    onError: (erro: Error) => toast.error(`Falha ao ocultar a flag: ${erro.message}`),
  });

  const excluir = useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase.from("feature_flags").delete().eq("key", key);
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      toast.success(`"${key}" removida.`);
      recarregar();
    },
    onError: (erro: Error) => toast.error(`Falha ao remover a flag: ${erro.message}`),
  });

  const criar = useMutation({
    mutationFn: async ({ key, description }: { key: string; description: string }) => {
      const { error } = await supabase
        .from("feature_flags")
        .insert({ key, description: description || null, enabled: false, active: true });
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      toast.success(`"${key}" criada desligada.`);
      setNovaChave("");
      setNovaDescricao("");
      recarregar();
    },
    onError: (erro: Error) => toast.error(`Falha ao criar a flag: ${erro.message}`),
  });

  const chaveInvalida = novaChave.length > 0 && !CHAVE_VALIDA.test(novaChave);
  const chaveRepetida = flags.some((f) => f.key === novaChave);
  const podeCriar = CHAVE_VALIDA.test(novaChave) && !chaveRepetida && !criar.isPending;

  if (flagsQuery.isLoading) return <DashboardSkeleton />;

  return (
    <>
      <Helmet>
        <title>Funcionalidades | Estoki WMS</title>
      </Helmet>
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Flag className="h-8 w-8 text-primary" />
              Funcionalidades
            </h1>
            <p className="mt-1 text-muted-foreground">
              Liga e desliga recursos do sistema sem novo deploy. A mudança vale para todos os
              usuários em até 5 minutos (ou no próximo recarregamento da página).
            </p>
          </div>
          <Button variant="outline" onClick={recarregar} disabled={flagsQuery.isFetching}>
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total de chaves" value={resumo.total} icon={Flag} />
          <StatCard title="Ligadas" value={resumo.ligadas} icon={Eye} />
          <StatCard title="Desligadas" value={resumo.desligadas} icon={EyeOff} />
          <StatCard title="Ocultas" value={resumo.ocultas} icon={EyeOff} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova funcionalidade</CardTitle>
            <CardDescription>
              A chave segue o formato <code className="font-mono">area.nome</code> (ex.:{" "}
              <code className="font-mono">feature.meu_recurso</code>). Ela nasce desligada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-1 sm:w-64">
                <Label htmlFor="flag-key">Chave</Label>
                <Input
                  id="flag-key"
                  value={novaChave}
                  onChange={(e) => setNovaChave(e.target.value.trim().toLowerCase())}
                  placeholder="feature.minha_flag"
                  className="font-mono"
                />
                {chaveInvalida && (
                  <p className="text-xs text-destructive">
                    Use minúsculas, números, ponto, hífen ou sublinhado (3 a 64 caracteres).
                  </p>
                )}
                {chaveRepetida && <p className="text-xs text-destructive">Essa chave já existe.</p>}
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="flag-desc">Descrição</Label>
                <Input
                  id="flag-desc"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Para que serve esta funcionalidade"
                />
              </div>
              <Button
                disabled={!podeCriar}
                onClick={() => criar.mutate({ key: novaChave, description: novaDescricao })}
              >
                <Plus className="mr-2 h-4 w-4" /> Criar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades cadastradas</CardTitle>
            <CardDescription>
              Ligada vale para todos; oculta deixa de ser lida pelo app sem perder o cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {flagsQuery.isError ? (
              <ErrorState
                message={`Não foi possível carregar as funcionalidades: ${
                  (flagsQuery.error as Error).message
                }`}
                onRetry={recarregar}
              />
            ) : flags.length === 0 ? (
              <EmptyState
                title="Nenhuma funcionalidade cadastrada"
                description="Crie a primeira chave acima."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {flags.map((flag) => (
                  <div
                    key={flag.key}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{flag.key}</span>
                        <Badge variant={flag.enabled ? "default" : "secondary"}>
                          {flag.enabled ? "Ligada" : "Desligada"}
                        </Badge>
                        {!flag.active && <Badge variant="outline">Oculta</Badge>}
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {flag.updated_at
                          ? `Atualizada ${formatDistanceToNow(new Date(flag.updated_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}`
                          : "Sem registro de atualização"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Switch
                        checked={flag.enabled}
                        aria-label={`Ligar ${flag.key}`}
                        disabled={alternar.isPending}
                        onCheckedChange={(valor) =>
                          alternar.mutate({ key: flag.key, enabled: valor })
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={flag.active ? `Ocultar ${flag.key}` : `Mostrar ${flag.key}`}
                        disabled={alternarVisibilidade.isPending}
                        onClick={() =>
                          alternarVisibilidade.mutate({ key: flag.key, active: !flag.active })
                        }
                      >
                        {flag.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Excluir ${flag.key}`}
                        disabled={excluir.isPending}
                        onClick={() => excluir.mutate(flag.key)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
