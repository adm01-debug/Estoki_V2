import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Camera, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Circle,
  Plus,
  Trash2,
  Search
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { TipoDefeito, StatusTriagem } from "@/types/estoque";

// Dados mockados do item para triagem
const mockItem = {
  id: 1,
  pedido: "2638-1",
  produto: "Mochila Executiva Preta",
  qtdTotal: 500,
  totalVolumes: 4,
  fornecedor: "XBZ Brindes",
  dataRecebimento: new Date("2025-12-16T14:30:00"),
};

// Checklist de inspeção (7 itens)
const checklistItems = [
  { id: "corConforme", label: "Cor conforme pedido", description: "A cor do produto corresponde ao solicitado" },
  { id: "tamanhoOk", label: "Tamanho/dimensões OK", description: "Dimensões dentro da especificação" },
  { id: "produtoLimpo", label: "Produto limpo", description: "Sem sujeira, poeira ou manchas" },
  { id: "semAvarias", label: "Sem avarias/defeitos visíveis", description: "Sem arranhões, amassados ou quebras" },
  { id: "embalagemIntegra", label: "Embalagem íntegra", description: "Embalagem original sem danos" },
  { id: "componentesCompletos", label: "Componentes completos", description: "Todos os acessórios inclusos" },
  { id: "funcionalidadeOk", label: "Funcionalidade OK", description: "Zíperes, botões, etc funcionando" },
];

const tiposDefeito: Array<{ value: TipoDefeito; label: string; emoji: string }> = [
  { value: "arranhao", label: "Arranhão/Risco", emoji: "🔍" },
  { value: "mancha", label: "Mancha/Sujeira", emoji: "🟤" },
  { value: "costura", label: "Costura defeituosa", emoji: "🧵" },
  { value: "componente_faltando", label: "Componente faltando", emoji: "❓" },
  { value: "cor_diferente", label: "Cor diferente", emoji: "🎨" },
  { value: "tamanho_errado", label: "Tamanho errado", emoji: "📏" },
  { value: "deformacao", label: "Deformação", emoji: "〰️" },
  { value: "quebra", label: "Quebra/Rachadura", emoji: "💔" },
  { value: "outro", label: "Outro", emoji: "📝" },
];

interface ChecklistState {
  [key: string]: boolean;
}

interface Defeito {
  id: number;
  tipo: TipoDefeito;
  descricao: string;
  fotos: string[];
  quantidade: number;
}

export default function FormularioTriagem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defeitoFileInputRef = useRef<HTMLInputElement>(null);

  // Estado do checklist
  const [checklist, setChecklist] = useState<ChecklistState>({
    corConforme: false,
    tamanhoOk: false,
    produtoLimpo: false,
    semAvarias: false,
    embalagemIntegra: false,
    componentesCompletos: false,
    funcionalidadeOk: false,
  });

  // Estado da contagem
  const [qtdAprovada, setQtdAprovada] = useState(mockItem.qtdTotal);
  
  // Estado dos defeitos
  const [defeitos, setDefeitos] = useState<Defeito[]>([]);
  const [showDefeitoModal, setShowDefeitoModal] = useState(false);
  const [defeitoAtual, setDefeitoAtual] = useState<Partial<Defeito>>({
    tipo: "arranhao",
    descricao: "",
    fotos: [],
    quantidade: 1,
  });
  const [editingDefeitoId, setEditingDefeitoId] = useState<number | null>(null);

  // Estado do teste funcional
  const [requerTeste, setRequerTeste] = useState(false);
  const [tipoTeste, setTipoTeste] = useState("");
  const [resultadoTeste, setResultadoTeste] = useState<"aprovado" | "reprovado" | "">("");

  // Cálculos
  const checklistCompleto = Object.values(checklist).every((v) => v);
  const totalDefeitosQtd = defeitos.reduce((acc, d) => acc + d.quantidade, 0);
  const qtdReprovada = mockItem.qtdTotal - qtdAprovada;
  const percentualAprovacao = (qtdAprovada / mockItem.qtdTotal) * 100;

  const getAprovacaoStatus = () => {
    if (percentualAprovacao >= 98) return { color: "text-success", bg: "bg-success/10", label: "Excelente" };
    if (percentualAprovacao >= 95) return { color: "text-success", bg: "bg-success/10", label: "Bom" };
    if (percentualAprovacao >= 90) return { color: "text-warning", bg: "bg-warning/10", label: "Aceitável" };
    return { color: "text-destructive", bg: "bg-destructive/10", label: "Crítico" };
  };

  const aprovacaoStatus = getAprovacaoStatus();

  // Handlers
  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist((prev) => ({ ...prev, [itemId]: checked }));
  };

  const handleAddDefeito = () => {
    setDefeitoAtual({ tipo: "arranhao", descricao: "", fotos: [], quantidade: 1 });
    setEditingDefeitoId(null);
    setShowDefeitoModal(true);
  };

  const handleEditDefeito = (defeito: Defeito) => {
    setDefeitoAtual(defeito);
    setEditingDefeitoId(defeito.id);
    setShowDefeitoModal(true);
  };

  const handleRemoveDefeito = (defeitoId: number) => {
    setDefeitos((prev) => prev.filter((d) => d.id !== defeitoId));
  };

  const handleSaveDefeito = () => {
    if (!defeitoAtual.tipo) return;

    if (editingDefeitoId !== null) {
      setDefeitos((prev) =>
        prev.map((d) =>
          d.id === editingDefeitoId
            ? { ...d, ...defeitoAtual } as Defeito
            : d
        )
      );
    } else {
      const newDefeito: Defeito = {
        id: Date.now(),
        tipo: defeitoAtual.tipo!,
        descricao: defeitoAtual.descricao || "",
        fotos: defeitoAtual.fotos || [],
        quantidade: defeitoAtual.quantidade || 1,
      };
      setDefeitos((prev) => [...prev, newDefeito]);
    }

    setShowDefeitoModal(false);
  };

  const handleDefeitoPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if ((defeitoAtual.fotos?.length || 0) >= 3) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setDefeitoAtual((prev) => ({
              ...prev,
              fotos: [...(prev.fotos || []), event.target!.result as string],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveDefeitoPhoto = (index: number) => {
    setDefeitoAtual((prev) => ({
      ...prev,
      fotos: prev.fotos?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAprovar = () => {
    toast({
      title: "Triagem aprovada!",
      description: `${qtdAprovada} unidades aprovadas (${percentualAprovacao.toFixed(1)}%)`,
    });
    navigate("/triagem");
  };

  const handleRessalva = () => {
    toast({
      title: "Triagem com ressalva",
      description: `${qtdAprovada} unidades aprovadas com ${defeitos.length} tipo(s) de defeito registrado(s)`,
    });
    navigate("/triagem");
  };

  const handleReprovar = () => {
    toast({
      title: "Triagem reprovada",
      description: "O lote foi marcado para análise",
      variant: "destructive",
    });
    navigate("/triagem");
  };

  return (
    <AppLayout title={`Triagem #${mockItem.pedido}`} showBack>
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in pb-32">
        {/* Info do Produto */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{mockItem.produto}</h3>
              <p className="text-sm text-muted-foreground">
                Pedido #{mockItem.pedido} | {mockItem.fornecedor}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{mockItem.qtdTotal} un</div>
              <div className="text-xs text-muted-foreground">{mockItem.totalVolumes} volumes</div>
            </div>
          </div>
        </section>

        {/* Checklist de Inspeção */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            ✅ CHECKLIST DE INSPEÇÃO
          </h3>
          
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <label
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                  checklist[item.id]
                    ? "border-success bg-success/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Checkbox
                  checked={checklist[item.id]}
                  onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {checklist[item.id] ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "font-medium",
                      checklist[item.id] && "text-success"
                    )}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Progresso do checklist */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {Object.values(checklist).filter(Boolean).length} / {checklistItems.length}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-success transition-all"
                style={{ width: `${(Object.values(checklist).filter(Boolean).length / checklistItems.length) * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* Contagem */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            📊 CONTAGEM
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Total Recebido</div>
                <div className="text-xl font-bold">{mockItem.qtdTotal} un</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Defeitos</div>
                <div className="text-xl font-bold text-destructive">{totalDefeitosQtd} un</div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Quantidade Aprovada</Label>
              <Input
                type="number"
                min={0}
                max={mockItem.qtdTotal}
                value={qtdAprovada}
                onChange={(e) => setQtdAprovada(Math.min(mockItem.qtdTotal, Math.max(0, parseInt(e.target.value) || 0)))}
                className="text-2xl font-bold h-14 text-center"
              />
            </div>

            {/* Indicador de Aprovação */}
            <div className={cn(
              "rounded-xl p-4 flex items-center justify-between",
              aprovacaoStatus.bg
            )}>
              <div>
                <div className="text-sm text-muted-foreground">% Aprovação</div>
                <div className={cn("text-3xl font-bold", aprovacaoStatus.color)}>
                  {percentualAprovacao.toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-lg font-bold px-3 py-1 rounded-full",
                  aprovacaoStatus.bg,
                  aprovacaoStatus.color
                )}>
                  {aprovacaoStatus.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {qtdReprovada} un reprovadas
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Defeitos Encontrados */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              ⚠️ DEFEITOS ENCONTRADOS
            </h3>
            <Button size="sm" variant="outline" className="gap-1" onClick={handleAddDefeito}>
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          {defeitos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success/50" />
              <p className="text-sm">Nenhum defeito registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {defeitos.map((defeito) => {
                const tipoInfo = tiposDefeito.find((t) => t.value === defeito.tipo);
                return (
                  <div
                    key={defeito.id}
                    className="bg-destructive/5 border border-destructive/20 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tipoInfo?.emoji}</span>
                        <div>
                          <div className="font-medium">{tipoInfo?.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {defeito.quantidade} unidade(s)
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEditDefeito(defeito)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveDefeito(defeito.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {defeito.descricao && (
                      <p className="text-sm text-muted-foreground mt-2">{defeito.descricao}</p>
                    )}
                    {defeito.fotos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {defeito.fotos.map((foto, i) => (
                          <img
                            key={i}
                            src={foto}
                            alt={`Defeito ${i + 1}`}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Teste Funcional */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            🧪 TESTE FUNCIONAL
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="requerTeste"
                checked={requerTeste}
                onCheckedChange={(checked) => setRequerTeste(checked as boolean)}
              />
              <Label htmlFor="requerTeste">Requer teste funcional</Label>
            </div>

            {requerTeste && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de teste</Label>
                  <Input
                    placeholder="Ex: Teste de escrita, vedação, resistência..."
                    value={tipoTeste}
                    onChange={(e) => setTipoTeste(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Resultado</Label>
                  <Select value={resultadoTeste} onValueChange={(v) => setResultadoTeste(v as "aprovado" | "reprovado")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aprovado">✅ Aprovado</SelectItem>
                      <SelectItem value="reprovado">❌ Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Ações Fixas */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:pl-72">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="h-12 gap-2 border-success text-success hover:bg-success/10"
                onClick={handleAprovar}
                disabled={!checklistCompleto || defeitos.length > 0}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span className="hidden sm:inline">Aprovar</span>
              </Button>
              <Button
                variant="outline"
                className="h-12 gap-2 border-warning text-warning hover:bg-warning/10"
                onClick={handleRessalva}
                disabled={!checklistCompleto}
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="hidden sm:inline">Ressalva</span>
              </Button>
              <Button
                variant="outline"
                className="h-12 gap-2 border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleReprovar}
              >
                <XCircle className="h-5 w-5" />
                <span className="hidden sm:inline">Reprovar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal de Defeito */}
        <Dialog open={showDefeitoModal} onOpenChange={setShowDefeitoModal}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDefeitoId ? "Editar Defeito" : "Registrar Defeito"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Defeito</Label>
                <Select
                  value={defeitoAtual.tipo}
                  onValueChange={(v) => setDefeitoAtual((prev) => ({ ...prev, tipo: v as TipoDefeito }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDefeito.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.emoji} {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Quantidade com defeito</Label>
                <Input
                  type="number"
                  min={1}
                  value={defeitoAtual.quantidade || 1}
                  onChange={(e) => setDefeitoAtual((prev) => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <Textarea
                  placeholder="Descreva o defeito encontrado..."
                  value={defeitoAtual.descricao || ""}
                  onChange={(e) => setDefeitoAtual((prev) => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Fotos do defeito */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  📸 Fotos do defeito (máx. 3)
                </Label>
                
                <input
                  ref={defeitoFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleDefeitoPhotoChange}
                />

                <div className="flex gap-2 flex-wrap">
                  {defeitoAtual.fotos?.map((foto, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveDefeitoPhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {(defeitoAtual.fotos?.length || 0) < 3 && (
                    <button
                      onClick={() => defeitoFileInputRef.current?.click()}
                      className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-xs mt-1">Foto</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowDefeitoModal(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSaveDefeito}>
                  {editingDefeitoId ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
