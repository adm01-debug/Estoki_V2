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
  RotateCcw,
  Truck,
  ClipboardEdit,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMovimentacoes, type TipoMovimentacao } from "@/hooks/useMovimentacoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const tiposMovimento: Array<{ value: TipoMovimentacao; label: string; icon: typeof ArrowRight }> = [
  { value: "armazenamento", label: "Armazenamento", icon: Package },
  { value: "separacao", label: "Separação", icon: ArrowRight },
  { value: "saida_transporte", label: "Saída para Transporte", icon: Truck },
  { value: "devolucao", label: "Devolução", icon: RotateCcw },
  { value: "ajuste_estoque", label: "Ajuste de Inventário", icon: ClipboardEdit },
];

const tipoIcons: Record<string, string> = {
  recebimento_nf: "📦",
  conferencia: "✅",
  triagem_inicio: "🔍",
  triagem_fim: "✔️",
  armazenamento: "📥",
  reserva: "🔒",
  separacao: "📤",
  conferencia_expedicao: "📋",
  carregamento: "🚚",
  saida_transporte: "🚀",
  entrega: "🎯",
  devolucao: "↩️",
  ajuste_estoque: "📝",
};

const tipoLabels: Record<string, string> = {
  recebimento_nf: "RECEBIMENTO NF",
  conferencia: "CONFERÊNCIA",
  triagem_inicio: "TRIAGEM INÍCIO",
  triagem_fim: "TRIAGEM FIM",
  armazenamento: "ARMAZENAMENTO",
  reserva: "RESERVA",
  separacao: "SEPARAÇÃO",
  conferencia_expedicao: "CONF. EXPEDIÇÃO",
  carregamento: "CARREGAMENTO",
  saida_transporte: "SAÍDA TRANSPORTE",
  entrega: "ENTREGA",
  devolucao: "DEVOLUÇÃO",
  ajuste_estoque: "AJUSTE ESTOQUE",
};

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
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentacao>("armazenamento");
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
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

          {/* Registrar Movimentação */}
          <TabsContent value="registrar" className="space-y-4">
            {/* Tipo de Movimento */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <Label className="text-sm font-medium mb-3 block">Tipo de Movimento:</Label>
              <RadioGroup
                value={tipoMovimento}
                onValueChange={(v) => setTipoMovimento(v as TipoMovimentacao)}
                className="space-y-2"
              >
                {tiposMovimento.map((tipo) => (
                  <div
                    key={tipo.value}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                      tipoMovimento === tipo.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setTipoMovimento(tipo.value)}
                  >
                    <RadioGroupItem value={tipo.value} id={tipo.value} />
                    <tipo.icon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={tipo.value} className="flex-1 cursor-pointer">
                      {tipo.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Item */}
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

            {/* Detalhes */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <Label className="text-sm font-medium mb-3 block">📍 DETALHES</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="localizacao" className="text-xs text-muted-foreground">Localização</Label>
                  <Input 
                    id="localizacao"
                    placeholder="Ex: PP1-S05-N2, BOX-12"
                    value={formData.localizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="quantidade" className="text-xs text-muted-foreground">Quantidade</Label>
                  <Input 
                    id="quantidade"
                    type="number" 
                    min={1}
                    value={formData.quantidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-xs text-muted-foreground">Descrição *</Label>
                  <Textarea 
                    id="descricao"
                    placeholder="Descreva a movimentação..."
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  />
                </div>
              </div>
            </div>

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

          {/* Histórico */}
          <TabsContent value="historico" className="space-y-4">
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

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-xl p-4 border border-border">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            ) : filteredMovimentacoes.length === 0 ? (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMovimentacoes.map((mov) => (
                  <div key={mov.id} className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
                    <div className="text-xs text-muted-foreground mb-2">
                      {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{tipoIcons[mov.tipo] || "📦"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{tipoLabels[mov.tipo] || mov.tipo.toUpperCase()}</div>
                        <div className="text-sm truncate">
                          {mov.produto_nome || mov.descricao}
                          {mov.quantidade > 0 && ` | ${mov.quantidade} un`}
                        </div>
                        {mov.localizacao && (
                          <div className="text-xs text-muted-foreground mt-1">
                            📍 {mov.localizacao}
                          </div>
                        )}
                        {mov.operador_nome && (
                          <div className="text-xs text-muted-foreground">
                            Por: {mov.operador_nome}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

