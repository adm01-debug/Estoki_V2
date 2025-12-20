import { useState, useRef, useEffect } from "react";
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
  Search,
  RotateCcw,
  Package,
  Loader2
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
import { useTriagemTimer } from "@/hooks/useTriagemTimer";
import { TriagemTimer } from "@/components/triagem/TriagemTimer";
import { VolumeContagem, type VolumeData } from "@/components/triagem/VolumeContagem";
import { DefeitoHistorico } from "@/components/triagem/DefeitoHistorico";
import { FotosLoteObrigatorias, useTriagemFotos } from "@/components/triagem/FotosLoteObrigatorias";
import { AmostragemAutomatica } from "@/components/triagem/AmostragemAutomatica";
import { useTriagens, Triagem, ChecklistTriagem, Defeito as DefeitoType } from "@/hooks/useTriagens";
import { useTrocasDevolucoes } from "@/hooks/useTrocasDevolucoes";
import type { TipoDefeito, StatusTriagem } from "@/types/estoque";

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
  const defeitoFileInputRef = useRef<HTMLInputElement>(null);

  // Hooks de integração com Supabase
  const { 
    getTriagemById, 
    iniciarTriagem, 
    atualizarChecklist, 
    registrarDefeito, 
    finalizarTriagem,
    loading: triagensLoading 
  } = useTriagens();
  const { criarRegistro: criarTrocaDevolucao } = useTrocasDevolucoes();

  // Estado da triagem carregada do banco
  const [triagem, setTriagem] = useState<Triagem | null>(null);
  const [loadingTriagem, setLoadingTriagem] = useState(true);

  // Timer de triagem
  const timer = useTriagemTimer();

  // Fotos obrigatórias do lote
  const fotosLote = useTriagemFotos({ triagemId: id });

  // Controle de início da triagem
  const [triagemIniciada, setTriagemIniciada] = useState(false);

  // Carregar triagem do banco
  useEffect(() => {
    const loadTriagem = async () => {
      if (!id) return;
      
      setLoadingTriagem(true);
      const data = await getTriagemById(id);
      
      if (data) {
        setTriagem(data);
        
        // Se já está em triagem, restaurar estado
        if (data.status === 'em_triagem') {
          setTriagemIniciada(true);
          if (data.checklist) {
            setChecklist(data.checklist as ChecklistState);
          }
          if (data.defeitos) {
            setDefeitos(data.defeitos.map((d: any, i: number) => ({
              id: i + 1,
              tipo: d.tipo,
              descricao: d.descricao || '',
              fotos: d.fotos || [],
              quantidade: d.quantidade || 1,
            })));
          }
        }
      }
      
      setLoadingTriagem(false);
    };
    
    loadTriagem();
  }, [id]);

  // Gerar volumes baseado na triagem carregada
  const generateVolumes = (): VolumeData[] => {
    if (!triagem) return [];
    
    const volumes: VolumeData[] = [];
    const totalVolumes = triagem.total_volumes || 1;
    const qtdTotal = triagem.qtd_total || 0;
    const qtdPorVolume = Math.floor(qtdTotal / totalVolumes);
    const resto = qtdTotal % totalVolumes;

    for (let i = 1; i <= totalVolumes; i++) {
      volumes.push({
        id: i,
        numero: `V${i}`,
        qtdEsperada: qtdPorVolume + (i <= resto ? 1 : 0),
        qtdContada: null,
        conferido: false,
      });
    }
    return volumes;
  };

  // Iniciar triagem após fotos
  const handleIniciarTriagem = async () => {
    if (!id || !fotosLote.requisitosAtendidos) return;
    
    const success = await iniciarTriagem(id);
    if (success) {
      setTriagemIniciada(true);
      timer.start();
    }
  };

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

  // Estado da contagem por volumes
  const [volumes, setVolumes] = useState<VolumeData[]>([]);

  // Inicializar volumes quando triagem carrega
  useEffect(() => {
    if (triagem) {
      setVolumes(generateVolumes());
    }
  }, [triagem]);

  // Calcula quantidade aprovada baseada nos volumes conferidos
  const qtdAprovada = volumes.reduce((acc, v) => acc + (v.conferido ? (v.qtdContada || 0) : 0), 0);
  const todosVolumesConferidos = volumes.length > 0 && volumes.every((v) => v.conferido);

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

  // Estado do modal de troca/devolução
  const [showTrocaDevolucaoModal, setShowTrocaDevolucaoModal] = useState(false);
  const [trocaDevolucaoData, setTrocaDevolucaoData] = useState<{
    tipo: "troca" | "devolucao";
    motivo: string;
    observacoes: string;
  }>({
    tipo: "devolucao",
    motivo: "",
    observacoes: "",
  });

  // Estado do teste funcional
  const [requerTeste, setRequerTeste] = useState(false);
  const [tipoTeste, setTipoTeste] = useState("");
  const [resultadoTeste, setResultadoTeste] = useState<"aprovado" | "reprovado" | "">("");

  // Estado da amostragem
  const [amostragemConfig, setAmostragemConfig] = useState<{
    tamanho: number;
    metodo: string;
    criterios: { aceite: number; rejeite: number };
  } | null>(null);
  const [itensVerificados, setItensVerificados] = useState(0);

  // Submitting state
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmarAmostra = (tamanho: number, metodo: string, criterios: { aceite: number; rejeite: number }) => {
    setAmostragemConfig({ tamanho, metodo, criterios });
  };

  // Atualiza itens verificados quando volumes são conferidos
  useEffect(() => {
    if (!triagem) return;
    
    const volumesConferidos = volumes.filter(v => v.conferido).length;
    if (amostragemConfig && volumesConferidos > 0) {
      const proporcao = volumesConferidos / (triagem.total_volumes || 1);
      setItensVerificados(Math.floor(amostragemConfig.tamanho * proporcao));
    }
  }, [volumes, amostragemConfig, triagem]);

  // Cálculos
  const checklistCompleto = Object.values(checklist).every((v) => v);
  const totalDefeitosQtd = defeitos.reduce((acc, d) => acc + d.quantidade, 0);
  const qtdTotal = triagem?.qtd_total || 0;
  const qtdReprovada = qtdTotal - qtdAprovada;
  const percentualAprovacao = qtdTotal > 0 ? (qtdAprovada / qtdTotal) * 100 : 0;

  const getAprovacaoStatus = () => {
    if (percentualAprovacao >= 98) return { color: "text-success", bg: "bg-success/10", label: "Excelente" };
    if (percentualAprovacao >= 95) return { color: "text-success", bg: "bg-success/10", label: "Bom" };
    if (percentualAprovacao >= 90) return { color: "text-warning", bg: "bg-warning/10", label: "Aceitável" };
    return { color: "text-destructive", bg: "bg-destructive/10", label: "Crítico" };
  };

  const aprovacaoStatus = getAprovacaoStatus();

  // Handlers de Volumes
  const handleVolumeChange = (volumeId: number, qtdContada: number) => {
    setVolumes((prev) =>
      prev.map((v) =>
        v.id === volumeId ? { ...v, qtdContada } : v
      )
    );
  };

  const handleVolumeConfirm = (volumeId: number) => {
    setVolumes((prev) =>
      prev.map((v) =>
        v.id === volumeId ? { ...v, conferido: true } : v
      )
    );
  };

  // Handlers de Checklist - salva no banco
  const handleChecklistChange = async (itemId: string, checked: boolean) => {
    const newChecklist = { ...checklist, [itemId]: checked };
    setChecklist(newChecklist);
    
    // Salvar no banco
    if (id) {
      await atualizarChecklist(id, newChecklist as ChecklistTriagem);
    }
  };

  // Handlers de Defeitos
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

  const handleSaveDefeito = async () => {
    if (!defeitoAtual.tipo || !id) return;

    const novoDefeito: DefeitoType = {
      tipo: defeitoAtual.tipo,
      descricao: defeitoAtual.descricao || "",
      fotos: defeitoAtual.fotos || [],
      quantidade: defeitoAtual.quantidade || 1,
    };

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
      
      // Salvar no banco
      await registrarDefeito(id, novoDefeito);
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

  // Ações finais - integradas com Supabase
  const handleFinalizar = async (status: 'aprovado' | 'ressalva' | 'reprovado') => {
    if (!id || !triagem) return;
    
    setSubmitting(true);
    
    const defeitosFormatados = defeitos.map(d => ({
      tipo: d.tipo,
      descricao: d.descricao,
      fotos: d.fotos,
      quantidade: d.quantidade,
    }));
    
    const success = await finalizarTriagem(id, {
      qtd_aprovada: qtdAprovada,
      qtd_reprovada: qtdReprovada,
      checklist: checklist as ChecklistTriagem,
      defeitos: defeitosFormatados,
      requer_teste: requerTeste,
      tipo_teste: tipoTeste,
      resultado_teste: resultadoTeste || undefined,
    }, qtdTotal);
    
    setSubmitting(false);
    
    if (success) {
      timer.pause();
      toast({
        title: status === 'aprovado' ? "Triagem Aprovada! ✅" : 
               status === 'ressalva' ? "Triagem com Ressalva ⚠️" : 
               "Triagem Reprovada ❌",
        description: `${qtdAprovada} unidades aprovadas de ${qtdTotal}`,
      });
      navigate("/triagem");
    }
  };

  const handleAprovar = () => handleFinalizar('aprovado');
  const handleRessalva = () => handleFinalizar('ressalva');
  
  const handleReprovar = () => {
    setShowTrocaDevolucaoModal(true);
  };

  const handleReprovarSemRegistro = async () => {
    await handleFinalizar('reprovado');
    setShowTrocaDevolucaoModal(false);
  };

  const handleConfirmarTrocaDevolucao = async () => {
    if (!triagem) return;
    
    // Criar registro de troca/devolução
    await criarTrocaDevolucao({
      tipo: trocaDevolucaoData.tipo,
      pedido: triagem.pedido,
      cliente: triagem.cliente_nome || 'Cliente',
      produto: triagem.produto,
      quantidade: qtdTotal,
      motivo: trocaDevolucaoData.motivo as any,
      descricao_problema: trocaDevolucaoData.observacoes,
    });
    
    toast({
      title: `${trocaDevolucaoData.tipo === 'troca' ? 'Troca' : 'Devolução'} registrada`,
      description: `${tiposDefeito.find(t => t.value === trocaDevolucaoData.motivo)?.label || trocaDevolucaoData.motivo} - ${qtdTotal} unidades`,
    });
    
    await handleFinalizar('reprovado');
    setShowTrocaDevolucaoModal(false);
  };

  // Loading state
  if (loadingTriagem) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Triagem não encontrada
  if (!triagem) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Triagem não encontrada</p>
          <Button onClick={() => navigate("/triagem")} className="mt-4">
            Voltar para Lista
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Triagem #${triagem.pedido}`} showBack>
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in pb-32">
        {/* Info do Produto */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{triagem.produto}</h3>
              <p className="text-sm text-muted-foreground">
                Pedido #{triagem.pedido} {triagem.cliente_nome && `| ${triagem.cliente_nome}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{qtdTotal} un</div>
              <div className="text-xs text-muted-foreground">{triagem.total_volumes || 1} volumes</div>
            </div>
          </div>
        </section>

        {/* Fotos Obrigatórias - primeira etapa */}
        {!triagemIniciada && (
          <>
            <FotosLoteObrigatorias
              triagemId={id}
              fotos={fotosLote.fotos}
              onAddFoto={fotosLote.addFotoFromFile}
              onRemoveFoto={fotosLote.removeFoto}
              uploading={fotosLote.uploading}
              minFotos={2}
            />

            <Button
              className="w-full h-14 text-lg gap-3"
              onClick={handleIniciarTriagem}
              disabled={!fotosLote.requisitosAtendidos || triagensLoading}
            >
              {triagensLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : fotosLote.requisitosAtendidos ? (
                <>
                  <Camera className="h-5 w-5" />
                  Iniciar Triagem
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  Capture as Fotos Obrigatórias
                </>
              )}
            </Button>
          </>
        )}

        {/* Resto do formulário - após fotos */}
        {triagemIniciada && (
          <>
            {/* Timer de Triagem */}
            <TriagemTimer
              formattedTime={timer.formattedTime}
              elapsedSeconds={timer.elapsedSeconds}
              isRunning={timer.isRunning}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
              startTime={timer.startTime}
            />

            {/* Amostragem Automática */}
            <AmostragemAutomatica
              tamanhoLote={qtdTotal}
              onConfirmarAmostra={handleConfirmarAmostra}
              itensVerificados={itensVerificados}
              defeitosEncontrados={totalDefeitosQtd}
            />

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

            {/* Histórico de Defeitos do Produto */}
            <DefeitoHistorico
              sku={triagem.pedido}
              produto={triagem.produto}
              historico={[]}
              totalTriagens={0}
            />

            {/* Contagem por Volume */}
            <VolumeContagem
              volumes={volumes}
              onVolumeChange={handleVolumeChange}
              onVolumeConfirm={handleVolumeConfirm}
              totalEsperado={qtdTotal}
            />

            {/* Resumo de Aprovação */}
            <section className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                📊 RESUMO
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Esperado</div>
                    <div className="text-lg font-bold">{qtdTotal} un</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Contado</div>
                    <div className="text-lg font-bold">{qtdAprovada} un</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Defeitos</div>
                    <div className="text-lg font-bold text-destructive">{totalDefeitosQtd} un</div>
                  </div>
                </div>

                {todosVolumesConferidos && (
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
                )}

                {!todosVolumesConferidos && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-center text-warning text-sm">
                    ⚠️ Confira todos os volumes para ver o resumo de aprovação
                  </div>
                )}
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
          </>
        )}

        {/* Ações Fixas */}
        {triagemIniciada && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:pl-72">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="h-12 gap-2 border-success text-success hover:bg-success/10"
                  onClick={handleAprovar}
                  disabled={!checklistCompleto || !todosVolumesConferidos || defeitos.length > 0 || submitting}
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  <span className="hidden sm:inline">Aprovar</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 gap-2 border-warning text-warning hover:bg-warning/10"
                  onClick={handleRessalva}
                  disabled={!checklistCompleto || !todosVolumesConferidos || submitting}
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertTriangle className="h-5 w-5" />}
                  <span className="hidden sm:inline">Ressalva</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={handleReprovar}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                  <span className="hidden sm:inline">Reprovar</span>
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {/* Modal de Troca/Devolução */}
        <Dialog open={showTrocaDevolucaoModal} onOpenChange={setShowTrocaDevolucaoModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Registrar Troca/Devolução
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-foreground font-medium">{triagem.produto}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pedido #{triagem.pedido} • {qtdTotal} un
                </p>
              </div>

              {/* Tipo */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Tipo de Solicitação</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={trocaDevolucaoData.tipo === "troca" ? "default" : "outline"}
                    className="h-16 flex flex-col gap-1"
                    onClick={() => setTrocaDevolucaoData(prev => ({ ...prev, tipo: "troca" }))}
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Troca</span>
                  </Button>
                  <Button
                    type="button"
                    variant={trocaDevolucaoData.tipo === "devolucao" ? "default" : "outline"}
                    className="h-16 flex flex-col gap-1"
                    onClick={() => setTrocaDevolucaoData(prev => ({ ...prev, tipo: "devolucao" }))}
                  >
                    <Package className="h-5 w-5" />
                    <span>Devolução</span>
                  </Button>
                </div>
              </div>

              {/* Motivo */}
              <div>
                <Label className="text-xs text-muted-foreground">Motivo</Label>
                <Select
                  value={trocaDevolucaoData.motivo}
                  onValueChange={(v) => setTrocaDevolucaoData(prev => ({ ...prev, motivo: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defeito">Defeito de Fabricação</SelectItem>
                    <SelectItem value="cor_errada">Cor Diferente do Pedido</SelectItem>
                    <SelectItem value="tamanho_errado">Tamanho Errado</SelectItem>
                    <SelectItem value="avaria_transporte">Produto Danificado</SelectItem>
                    <SelectItem value="quantidade_errada">Quantidade Incorreta</SelectItem>
                    <SelectItem value="produto_errado">Produto Errado</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observações */}
              <div>
                <Label className="text-xs text-muted-foreground">Observações</Label>
                <Textarea
                  placeholder="Detalhes adicionais sobre o problema..."
                  value={trocaDevolucaoData.observacoes}
                  onChange={(e) => setTrocaDevolucaoData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  className="w-full gap-2"
                  onClick={handleConfirmarTrocaDevolucao}
                  disabled={!trocaDevolucaoData.motivo || submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : trocaDevolucaoData.tipo === "troca" ? (
                    <><RotateCcw className="h-4 w-4" /> Registrar Troca</>
                  ) : (
                    <><Package className="h-4 w-4" /> Registrar Devolução</>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReprovarSemRegistro}
                  disabled={submitting}
                >
                  Reprovar sem Registro
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowTrocaDevolucaoModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
