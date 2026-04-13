import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Package, Filter, FileSpreadsheet, FileDown, BarChart3, AlertCircle } from "lucide-react";
import { useTrocasDevolucoes, type TrocaDevolucao, type TrocaDevolucaoInput, type StatusRegistro } from "@/hooks/useTrocasDevolucoes";
import { RegistroCard, motivoLabels, mapStatusToUI } from "@/components/trocas";
import { NovoRegistroDialog } from "@/components/trocas-page/NovoRegistroDialog";
import { DetalheRegistroDialog } from "@/components/trocas-page/DetalheRegistroDialog";

export default function TrocasDevolucoes() {
  const navigate = useNavigate();
  const { registros, loading, error, criarRegistro, atualizarStatus } = useTrocasDevolucoes();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'troca' | 'devolucao' | 'todos'>('todos');
  const [registroSelecionado, setRegistroSelecionado] = useState<TrocaDevolucao | null>(null);
  const [activeTab, setActiveTab] = useState('pendentes');
  const [saving, setSaving] = useState(false);

  const filteredRegistros = useMemo(() => {
    return registros.filter(r => {
      const matchesSearch = r.produto.toLowerCase().includes(searchTerm.toLowerCase()) || (r.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) || r.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || r.pedido.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
      const uiStatus = mapStatusToUI(r.status);
      let matchesTab = true;
      if (activeTab === 'pendentes') matchesTab = ['pendente', 'em_analise'].includes(uiStatus);
      else if (activeTab === 'em_andamento') matchesTab = ['autorizado', 'enviado'].includes(uiStatus);
      else if (activeTab === 'concluidos') matchesTab = ['concluido', 'recusado'].includes(uiStatus);
      return matchesSearch && matchesTipo && matchesTab;
    });
  }, [registros, searchTerm, filtroTipo, activeTab]);

  const counts = useMemo(() => ({
    pendentes: registros.filter(r => ['aberto', 'em_analise'].includes(r.status)).length,
    em_andamento: registros.filter(r => ['aprovado', 'em_transito', 'recebido'].includes(r.status)).length,
    concluidos: registros.filter(r => ['finalizado', 'recusado'].includes(r.status)).length,
    trocas: registros.filter(r => r.tipo === 'troca').length,
    devolucoes: registros.filter(r => r.tipo === 'devolucao').length,
  }), [registros]);

  const handleNovoRegistro = async (input: TrocaDevolucaoInput) => { setSaving(true); try { await criarRegistro(input); } finally { setSaving(false); } };
  const handleStatusChange = async (id: string, newStatus: StatusRegistro) => { await atualizarStatus(id, newStatus); setRegistroSelecionado(null); };

  const handleExportExcel = () => {
    const headers = ['ID', 'Tipo', 'Status', 'Produto', 'SKU', 'Quantidade', 'Cliente', 'Fornecedor', 'Motivo', 'Data Abertura'];
    const rows = filteredRegistros.map(r => [r.pedido, r.tipo === 'troca' ? 'Troca' : 'Devolução', r.status, r.produto, r.sku || '', r.quantidade.toString(), r.cliente, r.fornecedor || '', motivoLabels[r.motivo], format(new Date(r.data_abertura), 'dd/MM/yyyy', { locale: ptBR })]);
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `trocas-devolucoes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Relatório de Trocas e Devoluções', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    doc.text(`Total de registros: ${filteredRegistros.length}`, 14, 34);
    let yPos = 50; doc.setFontSize(9); doc.setTextColor(0);
    filteredRegistros.forEach((r) => { if (yPos > 270) { doc.addPage(); yPos = 20; } doc.text(`#${r.pedido} - ${r.produto} (${r.quantidade} un) - ${r.tipo}`, 14, yPos); yPos += 6; });
    doc.save(`trocas-devolucoes-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <AppLayout title="Trocas e Devoluções" rightAction={<div className="flex items-center gap-2"><Button variant="outline" onClick={() => navigate('/dashboard-trocas')}><BarChart3 className="h-4 w-4 mr-2" />Dashboard</Button><NovoRegistroDialog onSave={handleNovoRegistro} saving={saving} /></div>}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-warning">{counts.pendentes}</div><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-info">{counts.em_andamento}</div><p className="text-xs text-muted-foreground">Em Andamento</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-success">{counts.concluidos}</div><p className="text-xs text-muted-foreground">Concluídos</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-accent-foreground">{counts.trocas}</div><p className="text-xs text-muted-foreground">Trocas</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{counts.devolucoes}</div><p className="text-xs text-muted-foreground">Devoluções</p></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="pendentes">Pendentes ({counts.pendentes})</TabsTrigger>
              <TabsTrigger value="em_andamento">Em Andamento ({counts.em_andamento})</TabsTrigger>
              <TabsTrigger value="concluidos">Concluídos ({counts.concluidos})</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-[200px]" /></div>
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as 'troca' | 'devolucao' | 'todos')}><SelectTrigger className="w-[130px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="troca">Trocas</SelectItem><SelectItem value="devolucao">Devoluções</SelectItem></SelectContent></Select>
              <Button variant="outline" size="icon" onClick={handleExportExcel} title="Exportar Excel"><FileSpreadsheet className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={handleExportPDF} title="Exportar PDF"><FileDown className="h-4 w-4" /></Button>
            </div>
          </div>
          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-5 w-32 mb-3" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>)}</div>
            ) : error ? (
              <Card><CardContent className="p-8 text-center"><AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" /><p className="text-destructive">{error}</p></CardContent></Card>
            ) : filteredRegistros.length === 0 ? (
              <Card><CardContent className="p-8 text-center"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{searchTerm ? 'Nenhum registro encontrado' : 'Nenhum registro cadastrado'}</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredRegistros.map((registro) => <RegistroCard key={registro.id} registro={registro} onView={() => setRegistroSelecionado(registro)} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <DetalheRegistroDialog registro={registroSelecionado} open={!!registroSelecionado} onClose={() => setRegistroSelecionado(null)} onStatusChange={handleStatusChange} />
    </AppLayout>
  );
}
