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
import { useAuditLog, AuditAction, AuditLogEntry } from "@/hooks/useAuditLog";
import { useExport } from "@/hooks/useExport";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Search, 
  Download, 
  Filter, 
  RefreshCw, 
  History, 
  Shield, 
  Activity, 
  User,
  FileJson,
  Eye,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogPage() {
  const { logs, isLoading, getStats } = useAuditLog();
  
  const { exportData, isExporting } = useExport<AuditLogEntry>({
    table: "audit_logs",
    filename: `audit_logs_${format(new Date(), "yyyy-MM-dd")}`,
    columns: [
      { key: "created_at", header: "Data/Hora", transform: (v) => format(new Date(v as string), "dd/MM/yyyy HH:mm:ss") },
      { key: "user_email", header: "Usuário" },
      { key: "action", header: "Ação" },
      { key: "entity_type", header: "Entidade" },
      { key: "entity_label", header: "Detalhes" },
      { key: "ip_address", header: "IP" }
    ]
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const stats = getStats();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case "create": return <Badge className="bg-success hover:bg-success/80">Criação</Badge>;
      case "update": return <Badge className="bg-blue-500 hover:bg-blue-600">Atualização</Badge>;
      case "delete": return <Badge variant="destructive">Exclusão</Badge>;
      case "login": return <Badge variant="outline" className="border-primary text-primary">Login</Badge>;
      case "logout": return <Badge variant="outline">Logout</Badge>;
      case "approve": return <Badge className="bg-emerald-500">Aprovação</Badge>;
      case "reject": return <Badge variant="destructive">Rejeição</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const uniqueEntities = Array.from(new Set(logs.map(l => l.entity_type)));

  return (
    <AppLayout title="Logs de Auditoria" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Total de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Últimos 1000 registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4 text-orange-500" />
                  Eventos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hoje}</div>
                <p className="text-xs text-muted-foreground">Ações registradas nas últimas 24h</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.porAcao['login'] || 0}</div>
                <p className="text-xs text-muted-foreground">Logins registrados</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por usuário, entidade, ID..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Ações</SelectItem>
                    <SelectItem value="create">Criação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="delete">Exclusão</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Entidades</SelectItem>
                    {uniqueEntities.map(entity => (
                      <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2" disabled={isExporting}>
                      <Download className="h-4 w-4" />
                      {isExporting ? "Exportando..." : "Exportar"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => exportData("csv")}>Exportar CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportData("xlsx")}>Exportar Excel</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportData("pdf")}>Exportar PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Histórico Detalhado</CardTitle>
              <CardDescription>Rastreabilidade completa de todas as mudanças no sistema</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.user_nome || "Sistema"}</span>
                            <span className="text-xs text-muted-foreground">{log.user_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase">{log.entity_type}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{log.entity_id?.slice(0, 8)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.entity_label || "-"}</span>
                        </TableCell>
                        <TableCell className="text-right">
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
                              <ScrollArea className="max-h-[60vh] p-4 bg-muted rounded-md">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Informações Gerais</h4>
                                    <pre className="text-xs">{JSON.stringify({
                                      id: log.id,
                                      created_at: log.created_at,
                                      ip: log.ip_address,
                                      agent: log.user_agent
                                    }, null, 2)}</pre>
                                  </div>
                                  {log.old_values && (
                                    <div>
                                      <h4 className="text-xs font-bold uppercase text-red-500 mb-2">Valores Anteriores</h4>
                                      <pre className="text-xs bg-red-500/5 p-2 rounded">{JSON.stringify(log.old_values, null, 2)}</pre>
                                    </div>
                                  )}
                                  {log.new_values && (
                                    <div>
                                      <h4 className="text-xs font-bold uppercase text-success mb-2">Novos Valores</h4>
                                      <pre className="text-xs bg-success/5 p-2 rounded">{JSON.stringify(log.new_values, null, 2)}</pre>
                                    </div>
                                  )}
                                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-bold uppercase text-primary mb-2">Metadados Adicionais</h4>
                                      <pre className="text-xs">{JSON.stringify(log.metadata, null, 2)}</pre>
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          Nenhum registro encontrado com os filtros atuais.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
