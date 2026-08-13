import { AuditoriaEnterpriseViewer } from "@/components/admin/AuditoriaEnterpriseViewer";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuditLog } from "@/hooks/useAuditLog";
import type { AuditAction, AuditLogEntry } from "@/services/auditService";
import { useTableExport } from "@/hooks/useExport";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Download,
  RefreshCw,
  History,
  Shield,
  Activity,
  FileJson,
  Eye,
} from "lucide-react";
import { ExportButton } from "@/components/ImportExport/ExportButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { VirtualizedTable } from "@/components/data/VirtualizedTable";

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ page: 1, pageSize: 100 });
  const { logs, isLoading, getStats } = useAuditLog(filters);

  const { exportData, isExporting } = useTableExport<AuditLogEntry>({
    table: "audit_log",
    filename: `audit_log_${format(new Date(), "yyyy-MM-dd")}`,
    columns: [
      {
        key: "created_at",
        header: "Data/Hora",
        transform: (v) => format(new Date(v as string), "dd/MM/yyyy HH:mm:ss"),
      },
      { key: "user_email", header: "Usuário" },
      { key: "action", header: "Ação" },
      { key: "entity_type", header: "Entidade" },
      { key: "entity_label", header: "Detalhes" },
      { key: "ip_address", header: "IP" },
    ],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const stats = getStats();

  const filteredLogs = Array.isArray(logs)
    ? logs.filter((log: AuditLogEntry) => {
        const matchesSearch =
          log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
      })
    : [];

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case "create":
        return <Badge className="bg-success hover:bg-success/80">Criação</Badge>;
      case "update":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Atualização</Badge>;
      case "delete":
        return <Badge variant="destructive">Exclusão</Badge>;
      case "login":
        return (
          <Badge variant="outline" className="border-primary text-primary">
            Login
          </Badge>
        );
      case "logout":
        return <Badge variant="outline">Logout</Badge>;
      case "approve":
        return <Badge className="bg-emerald-500">Aprovação</Badge>;
      case "reject":
        return <Badge variant="destructive">Rejeição</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const uniqueEntities = Array.from(
    new Set(Array.isArray(logs) ? logs.map((l: AuditLogEntry) => l.entity_type) : [])
  );

  return (
    <AppLayout title="Logs de Auditoria" showBack>
      <PageTransition>
        <div className="space-y-8 p-4">
          <AuditoriaEnterpriseViewer />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="h-4 w-4 text-primary" />
                  Total de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Últimos registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <History className="h-4 w-4 text-orange-500" />
                  Eventos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hoje}</div>
                <p className="text-xs text-muted-foreground">Ações registradas hoje</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-success" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.porAcao["login"] || 0}</div>
                <p className="text-xs text-muted-foreground">Logins registrados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por usuário, entidade, ID..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <ExportButton
                  onExport={(format) => exportData(format)}
                  isExporting={isExporting}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Histórico Detalhado</CardTitle>
              <CardDescription>
                Rastreabilidade completa de todas as mudanças no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <VirtualizedTable
                  data={filteredLogs}
                  columns={[
                    {
                      header: "Data/Hora",
                      className: "w-[180px] font-mono text-xs",
                      cell: (log: AuditLogEntry) =>
                        format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
                    },
                    {
                      header: "Usuário",
                      className: "flex-[2]",
                      cell: (log: AuditLogEntry) => (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.user_nome || "Sistema"}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {log.user_email}
                          </span>
                        </div>
                      ),
                    },
                    {
                      header: "Ação",
                      className: "w-[120px]",
                      cell: (log: AuditLogEntry) => getActionBadge(log.action),
                    },
                    {
                      header: "Entidade",
                      className: "flex-1",
                      cell: (log: AuditLogEntry) => (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold uppercase">{log.entity_type}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {log.entity_id?.slice(0, 8)}
                          </span>
                        </div>
                      ),
                    },
                    {
                      header: "Detalhes",
                      className: "flex-[2]",
                      cell: (log: AuditLogEntry) => (
                        <span className="block truncate text-sm">{log.entity_label || "-"}</span>
                      ),
                    },
                    {
                      header: "Ver",
                      className: "w-[60px] text-right",
                      cell: (log: AuditLogEntry) => (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileJson className="h-5 w-5 text-primary" />
                                Detalhes do Evento
                              </DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh] rounded-md bg-muted p-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
                                    Informações Gerais
                                  </h4>
                                  <pre className="text-xs">
                                    {JSON.stringify(
                                      {
                                        id: log.id,
                                        created_at: log.created_at,
                                        ip: log.ip_address,
                                        agent: log.user_agent,
                                      },
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                                {log.old_values && (
                                  <div>
                                    <h4 className="mb-2 text-xs font-bold uppercase text-red-500">
                                      Valores Anteriores
                                    </h4>
                                    <pre className="rounded bg-red-500/5 p-2 text-xs">
                                      {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.new_values && (
                                  <div>
                                    <h4 className="mb-2 text-xs font-bold uppercase text-success">
                                      Novos Valores
                                    </h4>
                                    <pre className="rounded bg-success/5 p-2 text-xs">
                                      {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.metadata &&
                                  typeof log.metadata === "object" &&
                                  log.metadata !== null &&
                                  Object.keys(log.metadata).length > 0 && (
                                    <div>
                                      <h4 className="mb-2 text-xs font-bold uppercase text-primary">
                                        Metadados Adicionais
                                      </h4>
                                      <pre className="text-xs">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      ),
                    },
                  ]}
                  height="500px"
                />
              )}
              {filteredLogs.length === 0 && !isLoading && (
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                  <p>Nenhum registro encontrado com os filtros atuais.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
