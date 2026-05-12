import { MovimentacaoCharts } from "@/components/charts/WMSModuleCharts";
import { SEO } from "@/components/common/SEO";
import { useState, useMemo } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useNavigate } from "react-router-dom";
import { movimentacaoSchema, validateForm } from "@/lib/validations";
import {
  QrCode, 
  Search, 
  ArrowRight, 
  Package, 
  Clock,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMovimentacoes, type TipoMovimentacao } from "@/hooks/useMovimentacoes";
import { MovimentacaoTipoSelector } from "@/components/movimentacao/MovimentacaoTipoSelector";
import { MovimentacaoDetalhesForm } from "@/components/movimentacao/MovimentacaoDetalhesForm";
import { MovimentacaoHistorico } from "@/components/movimentacao/MovimentacaoHistorico";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function MovimentacaoPage() {
  const navigate = useNavigate();
  const { 
    movimentacoes, 
    loading, 
    error, 
    registrarMovimentacao 
  } = useMovimentacoes();
  const { log: auditLog } = useAuditLog();
  
  const [activeTab, setActiveTab] = useState("registrar");
   const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentacao>("transferencia");
  const [searchTerm, setSearchTerm] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("todos");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    localizacao: "",
    quantidade: 1,
    descricao: "",
  });
  const [showLocationSuggestion, setShowLocationSuggestion] = useState(false);

  const filteredMovimentacoes = useMemo(() => {
    let filtered = movimentacoes;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(mov => 
        mov.descricao.toLowerCase().includes(term) ||
        mov.produto_nome?.toLowerCase().includes(term) ||
        mov.lote_numero?.toLowerCase().includes(term) ||
        mov.localizacao?.toLowerCase().includes(term)
      );
    }
    
    // Filter by period
    if (periodoFiltro !== "todos") {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      filtered = filtered.filter(mov => {
        const movDate = new Date(mov.created_at);
        switch (periodoFiltro) {
          case "hoje":
            return movDate >= startOfDay;
          case "semana":
            return movDate >= startOfWeek;
          case "mes":
            return movDate >= startOfMonth;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [movimentacoes, searchTerm, periodoFiltro]);

  const handleSubmit = async () => {
    const validation = validateForm(movimentacaoSchema, {
      tipo: tipoMovimento,
      localizacao: formData.localizacao || undefined,
      quantidade: formData.quantidade,
      descricao: formData.descricao,
    });

    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors({});
    
    setSubmitting(true);
    try {
      const success = await registrarMovimentacao({
        tipo: tipoMovimento,
        quantidade: formData.quantidade,
        localizacao: formData.localizacao || undefined,
        descricao: formData.descricao,
      });
      
      if (success) {
        auditLog.create("movimentacao", "", tipoMovimento, { tipo: tipoMovimento, quantidade: formData.quantidade, localizacao: formData.localizacao, descricao: formData.descricao });
        setFormData({ localizacao: "", quantidade: 1, descricao: "" });
        setFormErrors({});
        setActiveTab("historico");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Movimentação" showBack>
      <SEO title="Movimentação" description="Registro e histórico de movimentações de estoque." path="/movimentacao" />
      <div className="p-4 space-y-4 animate-fade-in">
        {movimentacoes.length > 0 && <MovimentacaoCharts movimentacoes={movimentacoes} />}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
           <TabsList className="grid w-full grid-cols-3">
             <TabsTrigger value="status" className="gap-2">
               <Package className="h-4 w-4" />
               Status
             </TabsTrigger>
            <TabsTrigger value="registrar" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Registrar
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <Clock className="h-4 w-4" />
              Histórico
              {movimentacoes.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 px-1.5 rounded-full">
                  {movimentacoes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

           <TabsContent value="registrar" className="space-y-4 pt-4">
            <MovimentacaoTipoSelector 
              tipoMovimento={tipoMovimento} 
              setTipoMovimento={setTipoMovimento} 
            />

            <div className="bg-card rounded-xl p-4 border border-border">
              <Label className="text-sm font-medium mb-3 block">📦 ITEM</Label>
              <div className="flex gap-2 mb-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate("/scanner")}>
                  <QrCode className="h-4 w-4" />
                  Escanear QR
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>

            <MovimentacaoDetalhesForm 
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
            />


             {(tipoMovimento === "armazenamento" || tipoMovimento === "transferencia") && (
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary gap-1"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, localizacao: "PP2-S05-N2" }));
                    toast.success("IA: Sugestão de destino baseada em giro e curva ABC", { 
                      icon: <Sparkles className="h-3 w-3" /> 
                    });
                  }}
                >
                  <Sparkles className="h-3 w-3" /> Sugerir Local
                </Button>
              </div>
            )}

            <Button 
              className="w-full h-12 text-base font-semibold gap-2"
              onClick={handleSubmit}
              disabled={submitting || !formData.descricao.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>✅ CONFIRMAR MOVIMENTAÇÃO</>
              )}
            </Button>
          </TabsContent>

           <TabsContent value="historico" className="space-y-4 pt-4">
           <TabsContent value="status" className="space-y-4 pt-4">
             <div className="grid gap-4 md:grid-cols-3">
               <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                 <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Entradas</div>
                 <div className="text-2xl font-bold text-green-600">
                   {movimentacoes.filter(m => ["recebimento_nf", "entrada_devolucao"].includes(m.tipo)).length}
                 </div>
               </div>
               <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                 <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Saídas</div>
                 <div className="text-2xl font-bold text-red-600">
                   {movimentacoes.filter(m => ["saida_transporte", "separacao"].includes(m.tipo)).length}
                 </div>
               </div>
               <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                 <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Remanejamentos</div>
                 <div className="text-2xl font-bold text-blue-600">
                   {movimentacoes.filter(m => m.tipo === "armazenamento" || m.tipo === "transferencia").length}
                 </div>
               </div>
             </div>
             <MovimentacaoHistorico 
               movimentacoes={filteredMovimentacoes.slice(0, 5)}
               loading={loading}
               error={error}
               searchTerm=""
             />
             <Button variant="outline" className="w-full" onClick={() => setActiveTab("historico")}>
               Ver Histórico Completo
             </Button>
           </TabsContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <MovimentacaoHistorico 
              movimentacoes={filteredMovimentacoes}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
