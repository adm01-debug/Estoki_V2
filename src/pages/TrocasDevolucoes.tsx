import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { 
  Search, 
  Plus, 
  ArrowLeftRight, 
  Undo2, 
  Package, 
  Building2, 
  Calendar,
  FileText,
  Camera,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  Filter,
  ChevronRight,
  FileSpreadsheet,
  FileDown,
  BarChart3,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useTrocasDevolucoes, type TrocaDevolucao, type TrocaDevolucaoInput, type StatusRegistro, type MotivoTD } from "@/hooks/useTrocasDevolucoes";
import { StatusBadge, TipoBadge, WorkflowProgress, statusConfig, statusWorkflow, UIStatus, RegistroCard, motivoLabels, mapStatusToUI, mapUIStatusToDB } from "@/components/trocas";


const motivosDefeito: { value: MotivoTD; label: string }[] = [
  { value: 'defeito', label: 'Defeito de fabricação' },
  { value: 'cor_errada', label: 'Cor incorreta' },
  { value: 'tamanho_errado', label: 'Tamanho errado' },
  { value: 'quantidade_errada', label: 'Quantidade divergente' },
  { value: 'produto_errado', label: 'Produto incorreto' },
  { value: 'avaria_transporte', label: 'Avaria no transporte' },
  { value: 'desistencia', label: 'Desistência' },
  { value: 'outro', label: 'Outro' },
];


function NovoRegistroDialog({ onSave, saving }: { onSave: (input: TrocaDevolucaoInput) => Promise<void>; saving: boolean }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<'troca' | 'devolucao'>('troca');
  const [pedido, setPedido] = useState('');
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [sku, setSku] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [motivo, setMotivo] = useState<MotivoTD>('defeito');
  const [descricaoProblema, setDescricaoProblema] = useState('');
  
  const handleSave = async () => {
    await onSave({
      tipo,
      pedido,
      cliente,
      produto,
      sku: sku || undefined,
      quantidade: parseInt(quantidade),
      fornecedor: fornecedor || undefined,
      motivo,
      descricao_problema: descricaoProblema || undefined,
    });
    setOpen(false);
    // Reset form
    setTipo('troca');
    setPedido('');
    setCliente('');
    setProduto('');
    setSku('');
    setQuantidade('');
    setFornecedor('');
    setMotivo('defeito');
    setDescricaoProblema('');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Troca/Devolução</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as 'troca' | 'devolucao')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="troca">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Troca
                  </div>
                </SelectItem>
                <SelectItem value="devolucao">
                  <div className="flex items-center gap-2">
                    <Undo2 className="h-4 w-4" />
                    Devolução
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pedido *</Label>
              <Input 
                placeholder="Número do pedido" 
                value={pedido} 
                onChange={(e) => setPedido(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Input 
                placeholder="Nome do cliente" 
                value={cliente} 
                onChange={(e) => setCliente(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Input 
                placeholder="Nome do produto" 
                value={produto} 
                onChange={(e) => setProduto(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input 
                placeholder="SKU-001" 
                value={sku} 
                onChange={(e) => setSku(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade *</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={quantidade} 
                onChange={(e) => setQuantidade(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input 
                placeholder="Nome do fornecedor" 
                value={fornecedor} 
                onChange={(e) => setFornecedor(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoTD)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivosDefeito.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Descrição do Problema</Label>
            <Textarea 
              placeholder="Descreva o problema em detalhes..." 
              value={descricaoProblema} 
              onChange={(e) => setDescricaoProblema(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !pedido || !cliente || !produto || !quantidade}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetalheRegistroDialog({ registro, open, onClose, onStatusChange }: { 
  registro: TrocaDevolucao | null; 
  open: boolean; 
  onClose: () => void;
  onStatusChange: (id: string, newStatus: StatusRegistro) => void;
}) {
  if (!registro) return null;
  
  const uiStatus = mapStatusToUI(registro.status);
  const currentIndex = statusWorkflow.indexOf(uiStatus);
  const nextUIStatus = currentIndex < statusWorkflow.length - 1 ? statusWorkflow[currentIndex + 1] : null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">#{registro.pedido}</span>
            <TipoBadge tipo={registro.tipo} />
            <StatusBadge status={uiStatus} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{registro.produto}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {registro.sku && (
                <div>
                  <p className="text-muted-foreground">SKU</p>
                  <p className="font-medium">{registro.sku}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Quantidade</p>
                <p className="font-medium text-primary">{registro.quantidade} peças</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-medium">{registro.cliente}</p>
              </div>
              {registro.fornecedor && (
                <div>
                  <p className="text-muted-foreground">Fornecedor</p>
                  <p className="font-medium">{registro.fornecedor}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Workflow Progress */}
          <div>
            <h4 className="font-medium mb-3">Progresso do Workflow</h4>
            <div className="flex items-center gap-2">
              {statusWorkflow.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const config = statusConfig[step];
                
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center flex-1 ${isCurrent ? 'scale-110' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {config.icon}
                      </div>
                      <span className={`text-xs text-center ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {config.label}
                      </span>
                    </div>
                    {index < statusWorkflow.length - 1 && (
                      <div className={`h-0.5 w-full ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Defect Info */}
          <div>
            <h4 className="font-medium mb-2">Informações do Problema</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{motivoLabels[registro.motivo]}</span>
              </div>
              {registro.descricao_problema && (
                <p className="text-sm text-muted-foreground pl-6">{registro.descricao_problema}</p>
              )}
            </div>
          </div>
          
          {/* Photos */}
          {registro.fotos && registro.fotos.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Fotos</h4>
              <div className="grid grid-cols-3 gap-2">
                {registro.fotos.map((foto, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Values */}
          {(registro.valor_unitario || registro.valor_total) && (
            <div className="grid grid-cols-2 gap-4">
              {registro.valor_unitario && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Valor Unitário</p>
                  <p className="font-medium">R$ {registro.valor_unitario.toFixed(2)}</p>
                </div>
              )}
              {registro.valor_total && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                  <p className="font-medium">R$ {registro.valor_total.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Dates */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Data de Abertura</p>
              <p className="font-medium">{format(new Date(registro.data_abertura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
            {registro.data_analise && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Data de Análise</p>
                <p className="font-medium">{format(new Date(registro.data_analise), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
            )}
            {registro.data_resolucao && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Data de Resolução</p>
                <p className="font-medium">{format(new Date(registro.data_resolucao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
            )}
          </div>
          
          {/* Resolution */}
          {registro.resolucao && (
            <div>
              <h4 className="font-medium mb-2">Resolução</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {registro.resolucao}
              </p>
            </div>
          )}
          
          {/* Credit */}
          {registro.credito_gerado && registro.valor_credito && (
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
              <p className="text-xs text-green-400 mb-1">Crédito Gerado</p>
              <p className="font-bold text-green-400 text-lg">R$ {registro.valor_credito.toFixed(2)}</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          {uiStatus !== 'concluido' && uiStatus !== 'recusado' && nextUIStatus && (
            <div className="flex gap-2">
              <Button onClick={() => onStatusChange(registro.id, mapUIStatusToDB(nextUIStatus))}>
                Avançar para {statusConfig[nextUIStatus].label}
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => onStatusChange(registro.id, 'recusado')}
              >
                Recusar
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Page
export default function TrocasDevolucoes() {
  const navigate = useNavigate();
  const { 
    registros, 
    loading, 
    error, 
    criarRegistro, 
    atualizarStatus 
  } = useTrocasDevolucoes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'troca' | 'devolucao' | 'todos'>('todos');
  const [registroSelecionado, setRegistroSelecionado] = useState<TrocaDevolucao | null>(null);
  const [activeTab, setActiveTab] = useState('pendentes');
  const [saving, setSaving] = useState(false);
  
  // Filter registros
  const filteredRegistros = useMemo(() => {
    return registros.filter(r => {
      const matchesSearch = 
        r.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.pedido.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
      
      // Tab filtering
      const uiStatus = mapStatusToUI(r.status);
      let matchesTab = true;
      if (activeTab === 'pendentes') {
        matchesTab = ['pendente', 'em_analise'].includes(uiStatus);
      } else if (activeTab === 'em_andamento') {
        matchesTab = ['autorizado', 'enviado'].includes(uiStatus);
      } else if (activeTab === 'concluidos') {
        matchesTab = ['concluido', 'recusado'].includes(uiStatus);
      }
      
      return matchesSearch && matchesTipo && matchesTab;
    });
  }, [registros, searchTerm, filtroTipo, activeTab]);
  
  // Summary counts
  const counts = useMemo(() => ({
    pendentes: registros.filter(r => ['aberto', 'em_analise'].includes(r.status)).length,
    em_andamento: registros.filter(r => ['aprovado', 'em_transito', 'recebido'].includes(r.status)).length,
    concluidos: registros.filter(r => ['finalizado', 'recusado'].includes(r.status)).length,
    trocas: registros.filter(r => r.tipo === 'troca').length,
    devolucoes: registros.filter(r => r.tipo === 'devolucao').length,
  }), [registros]);
  
  const handleNovoRegistro = async (input: TrocaDevolucaoInput) => {
    setSaving(true);
    try {
      await criarRegistro(input);
    } finally {
      setSaving(false);
    }
  };
  
  const handleStatusChange = async (id: string, newStatus: StatusRegistro) => {
    await atualizarStatus(id, newStatus);
    setRegistroSelecionado(null);
  };

  // Export to Excel (CSV)
  const handleExportExcel = () => {
    const headers = ['ID', 'Tipo', 'Status', 'Produto', 'SKU', 'Quantidade', 'Cliente', 'Fornecedor', 'Motivo', 'Data Abertura'];
    
    const rows = filteredRegistros.map(r => [
      r.pedido,
      r.tipo === 'troca' ? 'Troca' : 'Devolução',
      r.status,
      r.produto,
      r.sku || '',
      r.quantidade.toString(),
      r.cliente,
      r.fornecedor || '',
      motivoLabels[r.motivo],
      format(new Date(r.data_abertura), 'dd/MM/yyyy', { locale: ptBR }),
    ]);
    
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => 
      row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trocas-devolucoes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Trocas e Devoluções', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.text(`Total de registros: ${filteredRegistros.length}`, 14, 34);
    
    let yPos = 50;
    doc.setFontSize(9);
    doc.setTextColor(0);
    
    filteredRegistros.forEach((r) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`#${r.pedido} - ${r.produto} (${r.quantidade} un) - ${r.tipo}`, 14, yPos);
      yPos += 6;
    });
    
    doc.save(`trocas-devolucoes-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  return (
    <AppLayout 
      title="Trocas e Devoluções" 
      rightAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard-trocas')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <NovoRegistroDialog onSave={handleNovoRegistro} saving={saving} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{counts.pendentes}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{counts.em_andamento}</div>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{counts.concluidos}</div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{counts.trocas}</div>
              <p className="text-xs text-muted-foreground">Trocas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-500">{counts.devolucoes}</div>
              <p className="text-xs text-muted-foreground">Devoluções</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="pendentes">
                Pendentes ({counts.pendentes})
              </TabsTrigger>
              <TabsTrigger value="em_andamento">
                Em Andamento ({counts.em_andamento})
              </TabsTrigger>
              <TabsTrigger value="concluidos">
                Concluídos ({counts.concluidos})
              </TabsTrigger>
              <TabsTrigger value="todos">
                Todos
              </TabsTrigger>
            </TabsList>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as 'troca' | 'devolucao' | 'todos')}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="troca">Trocas</SelectItem>
                  <SelectItem value="devolucao">Devoluções</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleExportExcel} title="Exportar Excel">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExportPDF} title="Exportar PDF">
                <FileDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-5 w-32 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : filteredRegistros.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum registro encontrado' : 'Nenhum registro cadastrado'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRegistros.map((registro) => (
                  <RegistroCard 
                    key={registro.id} 
                    registro={registro} 
                    onView={() => setRegistroSelecionado(registro)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Detail Dialog */}
      <DetalheRegistroDialog 
        registro={registroSelecionado}
        open={!!registroSelecionado}
        onClose={() => setRegistroSelecionado(null)}
        onStatusChange={handleStatusChange}
      />
    </AppLayout>
  );
}
