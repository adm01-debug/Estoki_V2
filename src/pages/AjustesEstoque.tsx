import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAdjustments, Adjustment } from "@/hooks/useAdjustments";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  History,
  ArrowUpDown,
  Filter,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function AjustesEstoquePage() {
  const { user, role } = useAuth();
  const { adjustments, isLoading, createAdjustment, updateStatus } = useAdjustments();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New Adjustment Form State
  const [newAdj, setNewAdj] = useState({
    produto_id: "",
    lote_id: "",
    posicao_id: "",
    quantidade_anterior: 0,
    quantidade_nova: 0,
    motivo: "correcao",
    observacoes: ""
  });

  const handleCreate = async () => {
    await createAdjustment.mutateAsync(newAdj as any);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovado": return <Badge className="bg-success gap-1"><CheckCircle2 className="h-3 w-3" /> Aprovado</Badge>;
      case "rejeitado": return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejeitado</Badge>;
      default: return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><History className="h-3 w-3" /> Pendente</Badge>;
    }
  };

  const filteredAdjustments = adjustments.filter(a => 
    a.produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = role === 'admin' || role === 'supervisor';

  return (
    <AppLayout title="Ajustes de Estoque" showBack>
      <PageTransition>
        <div className="p-4 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por produto ou motivo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto gap-2">
                  <Plus className="h-4 w-4" /> Novo Ajuste
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Solicitar Ajuste de Quantidade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Produto (ID)</Label>
                    <Input value={newAdj.produto_id} onChange={e => setNewAdj({...newAdj, produto_id: e.target.value})} placeholder="ID do produto..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Qtd. Atual</Label>
                      <Input type="number" value={newAdj.quantidade_anterior} onChange={e => setNewAdj({...newAdj, quantidade_anterior: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nova Qtd.</Label>
                      <Input type="number" value={newAdj.quantidade_nova} onChange={e => setNewAdj({...newAdj, quantidade_nova: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Motivo</Label>
                    <Select value={newAdj.motivo} onValueChange={v => setNewAdj({...newAdj, motivo: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="correcao">Correção de Contagem</SelectItem>
                        <SelectItem value="quebra">Quebra/Avaria</SelectItem>
                        <SelectItem value="perda">Perda/Extravio</SelectItem>
                        <SelectItem value="inventario">Ajuste de Inventário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={newAdj.observacoes} onChange={e => setNewAdj({...newAdj, observacoes: e.target.value})} placeholder="Explique o motivo do ajuste..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreate} disabled={createAdjustment.isPending}>Enviar para Aprovação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Histórico de Ajustes</CardTitle>
              <CardDescription>Acompanhe e aprove solicitações de alteração de estoque</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Diferença</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdjustments.map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell className="text-xs">
                          {format(new Date(adj.created_at), "dd/MM HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{adj.produto?.nome || "Produto desconhecido"}</span>
                            <span className="text-[10px] text-muted-foreground">{adj.lote?.numero_lote ? `Lote: ${adj.lote.numero_lote}` : adj.produto_id.slice(0,8)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={adj.diferenca > 0 ? "text-success" : "text-destructive"}>
                            {adj.diferenca > 0 ? `+${adj.diferenca}` : adj.diferenca}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize text-xs">{adj.motivo}</TableCell>
                        <TableCell>{getStatusBadge(adj.status)}</TableCell>
                        <TableCell className="text-right">
                          {adj.status === "pendente" && isAdmin ? (
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-success hover:text-success hover:bg-success/10"
                                onClick={() => updateStatus.mutate({ id: adj.id, status: "aprovado" })}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => updateStatus.mutate({ id: adj.id, status: "rejeitado" })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAdjustments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          Nenhum ajuste encontrado.
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