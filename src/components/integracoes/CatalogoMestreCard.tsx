import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Database, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProdutosSyncEstado } from "@/hooks/useProdutosSyncEstado";

function numero(valor: number | null | undefined) {
  return typeof valor === "number" ? valor.toLocaleString("pt-BR") : "—";
}

/** O erro do supabase-js e objeto plano (PostgrestError), nao instancia de Error. */
function mensagemDeErro(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

/** Estado da replicacao do catalogo mestre (edge produtos-sync) para `public.produtos`. */
export function CatalogoMestreCard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useProdutosSyncEstado();
  const resultado = data?.ultimo_resultado ?? null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-lg">Catálogo mestre de produtos</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {data?.ultima_execucao ? (
              <Badge variant="secondary">
                {formatDistanceToNow(new Date(data.ultima_execucao), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </Badge>
            ) : (
              <Badge variant="outline">Nunca sincronizado</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label="Atualizar estado do catálogo mestre"
            >
              <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Replicação incremental por <code>updated_at</code> para a tabela de produtos do WMS.
          {data?.origem ? ` Origem: ${data.origem}.` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando estado da sincronização…</p>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Não foi possível ler o estado da sincronização: {mensagemDeErro(error)}
          </p>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Processados</dt>
              <dd className="text-lg font-semibold">{numero(resultado?.processados)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Replicados</dt>
              <dd className="text-lg font-semibold">{numero(resultado?.replicados)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Ignorados</dt>
              <dd className="text-lg font-semibold">{numero(resultado?.ignorados)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">Duração</dt>
              <dd className="text-lg font-semibold">
                {typeof (resultado?.duracao_ms ?? data?.ultima_duracao_ms) === "number"
                  ? `${numero(resultado?.duracao_ms ?? data?.ultima_duracao_ms)} ms`
                  : "—"}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-xs text-muted-foreground uppercase">Cursor</dt>
              <dd className="font-mono text-sm break-all">
                {data?.origem_atualizada_ate
                  ? `${data.origem_atualizada_ate} · ${data.origem_sku ?? "—"}`
                  : "—"}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
