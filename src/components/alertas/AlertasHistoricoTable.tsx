import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, AlertTriangle, XCircle, Filter, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface AlertaHistorico {
  id: string;
  titulo: string;
  mensagem: string;
  severidade: 'info' | 'warning' | 'critical';
  status: 'ativo' | 'reconhecido' | 'resolvido';
  dados_contexto?: Record<string, unknown>;
  created_at: string;
}

const severidadeConfig = {
  info: { label: "Info", color: "bg-blue-500", icon: Bell },
  warning: { label: "Aviso", color: "bg-amber-500", icon: AlertTriangle },
  critical: { label: "Crítico", color: "bg-red-500", icon: XCircle },
};

const statusConfig = {
  ativo: { label: "Ativo", variant: "destructive" as const },
  reconhecido: { label: "Reconhecido", variant: "secondary" as const },
  resolvido: { label: "Resolvido", variant: "outline" as const },
};

interface Props {
  historico: AlertaHistorico[];
  loading: boolean;
  filtroSeveridade: string;
  filtroStatus: string;
  onChangeSeveridade: (v: string) => void;
  onChangeStatus: (v: string) => void;
  onReconhecer: (id: string) => void;
  onResolver: (id: string) => void;
}

export function AlertasHistoricoTable({ historico, loading, filtroSeveridade, filtroStatus, onChangeSeveridade, onChangeStatus, onReconhecer, onResolver }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select className="border rounded px-3 py-1.5 text-sm" value={filtroSeveridade} onChange={(e) => onChangeSeveridade(e.target.value)}>
            <option value="todos">Todas severidades</option>
            <option value="critico">Crítico</option>
            <option value="aviso">Aviso</option>
            <option value="info">Info</option>
          </select>
        </div>
        <select className="border rounded px-3 py-1.5 text-sm" value={filtroStatus} onChange={(e) => onChangeStatus(e.target.value)}>
          <option value="todos">Todos status</option>
          <option value="ativo">Ativo</option>
          <option value="reconhecido">Reconhecido</option>
          <option value="resolvido">Resolvido</option>
        </select>
      </div>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum alerta encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.map((alerta) => {
                    const sevConfig = severidadeConfig[alerta.severidade];
                    const SevIcon = sevConfig.icon;
                    return (
                      <TableRow key={alerta.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${sevConfig.color}`}>
                              <SevIcon className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm">{sevConfig.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{alerta.titulo}</TableCell>
                        <TableCell className="max-w-xs truncate">{alerta.mensagem}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(alerta.created_at), { addSuffix: true, locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[alerta.status].variant}>{statusConfig[alerta.status].label}</Badge>
                        </TableCell>
                        <TableCell>
                          {alerta.status === 'ativo' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => onReconhecer(alerta.id)}>Reconhecer</Button>
                              <Button size="sm" variant="default" onClick={() => onResolver(alerta.id)}>Resolver</Button>
                            </div>
                          )}
                          {alerta.status === 'reconhecido' && (
                            <Button size="sm" variant="default" onClick={() => onResolver(alerta.id)}>Resolver</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
