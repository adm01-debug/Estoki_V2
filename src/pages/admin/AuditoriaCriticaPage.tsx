import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Boxes,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

// Ações consideradas críticas (RPCs SECURITY DEFINER e mutações sensíveis)
const CRITICAL_ACTIONS = new Set([
  "adjust",
  "approve",
  "reject",
  "delete",
  "role_change",
  "role_grant",
  "role_revoke",
  "permission_change",
  "reset_password",
  "impersonate",
  "export",
]);

type ProfileMap = Record<string, { nome: string | null; email: string | null }>;

function useProfileMap(userIds: (string | null | undefined)[]) {
  const ids = useMemo(
    () => Array.from(new Set(userIds.filter((id): id is string => !!id))),
    [userIds]
  );
  return useQuery({
    queryKey: ["auditoria-critica", "profiles", ids],
    enabled: ids.length > 0,
    staleTime: 60_000,
    queryFn: async (): Promise<ProfileMap> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, email")
        .in("id", ids);
      if (error) throw error;
      const map: ProfileMap = {};
      for (const p of data ?? []) {
        map[p.id] = { nome: p.nome, email: p.email };
      }
      return map;
    },
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return format(new Date(value), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
}

function UserCell({
  userId,
  profiles,
}: {
  userId: string | null | undefined;
  profiles: ProfileMap;
}) {
  if (!userId) {
    return <span className="text-xs text-muted-foreground">Sistema</span>;
  }
  const profile = profiles[userId];
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium">{profile?.nome ?? "Usuário"}</span>
      <span className="truncate text-xs text-muted-foreground">
        {profile?.email ?? userId.slice(0, 8)}
      </span>
    </div>
  );
}

function LoadingRows({ cols }: { cols: number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ============ Ações Críticas (audit_log) ============
function CriticalActionsTab({ search }: { search: string }) {
  const query = useQuery({
    queryKey: ["auditoria-critica", "actions"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("id, user_id, action, entity_type, entity_id, entity_label, ip_address, created_at")
        .in("action", Array.from(CRITICAL_ACTIONS))
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = query.data ?? [];
  const { data: profiles = {} } = useProfileMap(rows.map((r) => r.user_id));

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const profile = r.user_id ? profiles[r.user_id] : undefined;
    return (
      r.action?.toLowerCase().includes(s) ||
      r.entity_type?.toLowerCase().includes(s) ||
      r.entity_label?.toLowerCase().includes(s) ||
      profile?.nome?.toLowerCase().includes(s) ||
      profile?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Quando</TableHead>
          <TableHead>Quem</TableHead>
          <TableHead>Ação</TableHead>
          <TableHead>Entidade</TableHead>
          <TableHead>Detalhes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.isLoading ? (
          <LoadingRows cols={5} />
        ) : filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
              Nenhuma ação crítica registrada.
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{formatDate(r.created_at)}</TableCell>
              <TableCell>
                <UserCell userId={r.user_id} profiles={profiles} />
              </TableCell>
              <TableCell>
                <Badge variant="destructive" className="uppercase">
                  {r.action}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase">{r.entity_type}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {r.entity_id?.slice(0, 12) ?? "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-md truncate text-sm">{r.entity_label ?? "-"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// ============ Movimentações de estoque ============
function StockChangesTab({ search }: { search: string }) {
  const query = useQuery({
    queryKey: ["auditoria-critica", "stock"],
    staleTime: 30_000,
    queryFn: async () => {
      const [ajustes, movs] = await Promise.all([
        supabase
          .from("ajustes_estoque")
          .select(
            "id, produto_id, lote_id, quantidade_anterior, quantidade_nova, diferenca, motivo, status, operador_id, aprovado_por, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("stock_movements")
          .select("id, product_id, type, quantity, from_location, to_location, user_id, created_at")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      if (ajustes.error) throw ajustes.error;
      if (movs.error) throw movs.error;
      return { ajustes: ajustes.data ?? [], movs: movs.data ?? [] };
    },
  });

  const ajustes = query.data?.ajustes ?? [];
  const movs = query.data?.movs ?? [];
  const { data: profiles = {} } = useProfileMap([
    ...ajustes.map((a) => a.operador_id),
    ...ajustes.map((a) => a.aprovado_por),
    ...movs.map((m) => m.user_id),
  ]);

  const s = search.toLowerCase();
  const filteredAjustes = ajustes.filter((a) => {
    if (!s) return true;
    const p = a.operador_id ? profiles[a.operador_id] : undefined;
    return (
      a.motivo?.toLowerCase().includes(s) ||
      a.status?.toLowerCase().includes(s) ||
      p?.nome?.toLowerCase().includes(s) ||
      p?.email?.toLowerCase().includes(s)
    );
  });
  const filteredMovs = movs.filter((m) => {
    if (!s) return true;
    const p = m.user_id ? profiles[m.user_id] : undefined;
    return (
      m.type?.toLowerCase().includes(s) ||
      p?.nome?.toLowerCase().includes(s) ||
      p?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Ajustes de estoque</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Quando</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Δ</TableHead>
              <TableHead>Antes → Depois</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <LoadingRows cols={6} />
            ) : filteredAjustes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  Nenhum ajuste encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredAjustes.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{formatDate(a.created_at)}</TableCell>
                  <TableCell>
                    <UserCell userId={a.operador_id} profiles={profiles} />
                  </TableCell>
                  <TableCell
                    className={`font-mono text-sm ${
                      (a.diferenca ?? 0) < 0 ? "text-destructive" : "text-success"
                    }`}
                  >
                    {(a.diferenca ?? 0) > 0 ? "+" : ""}
                    {a.diferenca ?? 0}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {a.quantidade_anterior} → {a.quantidade_nova}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.status === "aprovado"
                          ? "default"
                          : a.status === "rejeitado"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{a.motivo ?? "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          Movimentações de estoque
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Quando</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Origem → Destino</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <LoadingRows cols={5} />
            ) : filteredMovs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredMovs.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{formatDate(m.created_at)}</TableCell>
                  <TableCell>
                    <UserCell userId={m.user_id} profiles={profiles} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {m.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{m.quantity}</TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-[10px] text-muted-foreground">
                    {(m.from_location ?? "—").slice(0, 8)} → {(m.to_location ?? "—").slice(0, 8)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ Eventos de XP ============
function XpEventsTab({ search }: { search: string }) {
  const query = useQuery({
    queryKey: ["auditoria-critica", "xp"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_historico")
        .select("id, user_id, quantidade, tipo, descricao, referencia_id, created_at")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = query.data ?? [];
  const { data: profiles = {} } = useProfileMap(rows.map((r) => r.user_id));

  const s = search.toLowerCase();
  const filtered = rows.filter((r) => {
    if (!s) return true;
    const p = r.user_id ? profiles[r.user_id] : undefined;
    return (
      r.tipo?.toLowerCase().includes(s) ||
      r.descricao?.toLowerCase().includes(s) ||
      p?.nome?.toLowerCase().includes(s) ||
      p?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Quando</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>XP</TableHead>
          <TableHead>Descrição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.isLoading ? (
          <LoadingRows cols={5} />
        ) : filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
              Nenhum evento de XP registrado.
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{formatDate(r.created_at)}</TableCell>
              <TableCell>
                <UserCell userId={r.user_id} profiles={profiles} />
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="uppercase">
                  {r.tipo}
                </Badge>
              </TableCell>
              <TableCell
                className={`font-mono text-sm ${
                  (r.quantidade ?? 0) < 0 ? "text-destructive" : "text-success"
                }`}
              >
                {(r.quantidade ?? 0) > 0 ? "+" : ""}
                {r.quantidade ?? 0}
              </TableCell>
              <TableCell className="max-w-md truncate text-sm">{r.descricao ?? "-"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default function AuditoriaCriticaPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("acoes");

  return (
    <AppLayout title="Auditoria Crítica" showBack>
      <PageTransition>
        <div className="space-y-6 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Painel de Auditoria Crítica
              </CardTitle>
              <CardDescription>
                Acompanhe ações sensíveis (RPCs SECURITY DEFINER), mudanças de estoque e eventos de
                XP — com autor e horário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por usuário, ação, motivo, tipo..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.location.reload()}
                  aria-label="Recarregar"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="acoes" className="gap-2">
                <ShieldAlert className="h-4 w-4" /> Ações críticas
              </TabsTrigger>
              <TabsTrigger value="estoque" className="gap-2">
                <Boxes className="h-4 w-4" /> Estoque
              </TabsTrigger>
              <TabsTrigger value="xp" className="gap-2">
                <Sparkles className="h-4 w-4" /> XP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="acoes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-primary" /> Ações críticas registradas
                  </CardTitle>
                  <CardDescription>
                    Aprovações, rejeições, exclusões, ajustes e mudanças de papel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CriticalActionsTab search={search} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estoque">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Boxes className="h-4 w-4 text-primary" /> Mudanças de estoque
                  </CardTitle>
                  <CardDescription>
                    Ajustes aprovados/pendentes e movimentações registradas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StockChangesTab search={search} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="xp">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle className="h-4 w-4 text-primary" /> Eventos de XP
                  </CardTitle>
                  <CardDescription>
                    Todo XP ganho/descontado por usuário, com origem.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <XpEventsTab search={search} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
