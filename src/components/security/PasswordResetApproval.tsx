import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KeyRound, Check, X, Clock, Loader2, Send, AlertTriangle } from 'lucide-react';
import { usePasswordResetRequests } from '@/hooks/usePasswordResetRequests';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PasswordResetApproval() {
  const { requests, myRequests, loading, createRequest, approveRequest, rejectRequest, pendingCount } = usePasswordResetRequests();
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionDialog, setActionDialog] = useState<{ type: 'approve' | 'reject'; id: string } | null>(null);
  const [observacao, setObservacao] = useState('');

  const handleCreateRequest = async () => {
    if (!motivo.trim()) return;
    setSubmitting(true);
    await createRequest(motivo);
    setMotivo('');
    setSubmitting(false);
  };

  const handleAction = async () => {
    if (!actionDialog) return;
    setSubmitting(true);
    
    if (actionDialog.type === 'approve') {
      await approveRequest(actionDialog.id, observacao);
    } else {
      if (!observacao.trim()) {
        setSubmitting(false);
        return;
      }
      await rejectRequest(actionDialog.id, observacao);
    }
    
    setActionDialog(null);
    setObservacao('');
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600"><Check className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600"><X className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      case 'expirado':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="request" className="space-y-4">
        <TabsList>
          <TabsTrigger value="request" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Solicitar Reset
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Aprovações
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          {/* Create Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Solicitar Reset de Senha
              </CardTitle>
              <CardDescription>
                Solicite um reset de senha. Um administrador precisará aprovar antes do envio do email de recuperação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Motivo da solicitação</Label>
                <Textarea
                  placeholder="Ex: Esqueci minha senha, preciso redefinir..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateRequest} disabled={!motivo.trim() || submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Enviar Solicitação
              </Button>
            </CardContent>
          </Card>

          {/* My Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Minhas Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              {myRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhuma solicitação encontrada</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="text-sm">
                          {format(new Date(req.solicitado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{req.motivo || '-'}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {req.observacao_admin || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Solicitações de Reset de Senha
              </CardTitle>
              <CardDescription>
                Aprove ou rejeite solicitações de reset de senha dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <KeyRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma solicitação encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="text-sm">
                          {format(new Date(req.solicitado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{req.user_email}</TableCell>
                        <TableCell className="max-w-xs truncate">{req.motivo || '-'}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(req.expira_em), "dd/MM HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === 'pendente' && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => setActionDialog({ type: 'approve', id: req.id })}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setActionDialog({ type: 'reject', id: req.id })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'approve' 
                ? 'Ao aprovar, um email de reset será enviado ao usuário.'
                : 'Informe o motivo da rejeição.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{actionDialog?.type === 'approve' ? 'Observação (opcional)' : 'Motivo da rejeição *'}</Label>
              <Textarea
                placeholder={actionDialog?.type === 'approve' ? 'Observação...' : 'Informe o motivo...'}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancelar</Button>
            <Button 
              onClick={handleAction} 
              disabled={submitting || (actionDialog?.type === 'reject' && !observacao.trim())}
              variant={actionDialog?.type === 'approve' ? 'default' : 'destructive'}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {actionDialog?.type === 'approve' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
