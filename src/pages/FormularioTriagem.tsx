import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTriagens } from "@/hooks/useTriagens";
import { useTriagemTimer } from "@/hooks/useTriagemTimer";
import { useTriagemFotos } from "@/hooks/useTriagemFotos";
import { TriagemTimer } from "@/components/triagem/TriagemTimer";
import { AmostragemAutomatica } from "@/components/triagem/AmostragemAutomatica";
import { DefeitoHistorico, mockHistoricoDefeitos } from "@/components/triagem/DefeitoHistorico";
import { FotosLoteObrigatorias } from "@/components/triagem/FotosLoteObrigatorias";
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Camera,
  Clock,
  AlertTriangle,
  Timer,
  ImagePlus
} from "lucide-react";

// Checklist de inspeção
const checklistItems = [
  { id: "corConforme", label: "Cor conforme pedido" },
  { id: "tamanhoOk", label: "Tamanho/dimensões OK" },
  { id: "produtoLimpo", label: "Produto limpo" },
  { id: "semAvarias", label: "Sem avarias/defeitos visíveis" },
  { id: "embalagemIntegra", label: "Embalagem íntegra" },
  { id: "componentesCompletos", label: "Componentes completos" },
  { id: "funcionalidadeOk", label: "Funcionalidade OK" },
];

export default function FormularioTriagem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getTriagemById, finalizarTriagem, loading: triagensLoading } = useTriagens();
  
  // Hooks de triagem
  const {
    tempoDecorrido,
    tempoFormatado,
    iniciado,
    pausado,
    iniciar: iniciarTimer,
    pausar: pausarTimer,
    retomar: retomarTimer,
    parar: pararTimer,
    reset: resetTimer,
  } = useTriagemTimer();

  const {
    fotos,
    loading: loadingFotos,
    adicionarFoto,
    removerFoto,
    uploadFotos,
    validarFotosObrigatorias,
  } = useTriagemFotos(id || "");
  
  const [triagem, setTriagem] = useState<any>(null);
  const [loadingTriagem, setLoadingTriagem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState("");
  const [quantidadeAprovada, setQuantidadeAprovada] = useState(0);
  const [quantidadeReprovada, setQuantidadeReprovada] = useState(0);
  const [mostrarAmostragem, setMostrarAmostragem] = useState(true);
  const [tamanhoAmostra, setTamanhoAmostra] = useState(0);

  useEffect(() => {
    const carregarTriagem = async () => {
      if (!id) return;
      
      setLoadingTriagem(true);
      const data = await getTriagemById(id);
      if (data) {
        setTriagem(data);
        setQuantidadeAprovada(data.quantidade_total || 0);
        // Iniciar timer automaticamente ao carregar
        iniciarTimer();
      }
      setLoadingTriagem(false);
    };
    
    carregarTriagem();

    // Cleanup - pausar timer ao sair
    return () => {
      pararTimer();
    };
  }, [id, getTriagemById]);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [itemId]: checked }));
  };

  const calcularProgressoChecklist = () => {
    const totalItems = checklistItems.length;
    const checkedItems = Object.values(checklist).filter(Boolean).length;
    return (checkedItems / totalItems) * 100;
  };

  const todosItensVerificados = () => {
    return checklistItems.every(item => checklist[item.id] === true);
  };

  const handleSubmit = async (resultado: "aprovado" | "reprovado") => {
    if (!id || !triagem) return;

    // Validar fotos obrigatórias
    const fotosValidas = validarFotosObrigatorias();
    if (!fotosValidas.valido) {
      toast({
        title: "Fotos obrigatórias",
        description: `Faltam fotos: ${fotosValidas.faltando.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    pararTimer();

    try {
      // Fazer upload das fotos primeiro
      if (fotos.length > 0) {
        await uploadFotos();
      }

      // Finalizar triagem
      await finalizarTriagem(id, {
        resultado,
        quantidade_aprovada: resultado === "aprovado" ? quantidadeAprovada : 0,
        quantidade_reprovada: resultado === "reprovado" ? quantidadeReprovada : quantidadeAprovada,
        observacoes,
        checklist,
        tempo_triagem_segundos: tempoDecorrido,
      });

      toast({
        title: resultado === "aprovado" ? "Triagem aprovada!" : "Triagem reprovada",
        description: `Tempo de triagem: ${tempoFormatado}`,
      });

      navigate("/triagem");
    } catch (err) {
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar a triagem",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTriagem || triagensLoading) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!triagem) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="p-4 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold">Triagem não encontrada</h2>
          <Button onClick={() => navigate("/triagem")} className="mt-4">
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const progressoChecklist = calcularProgressoChecklist();

  return (
    <AppLayout title="Formulário de Triagem" showBack>
      <div className="p-4 space-y-6 lg:pl-72">
        {/* Header com informações do lote */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Lote: {triagem.numero_lote || triagem.numero_pedido}
                </CardTitle>
                <CardDescription>
                  {triagem.produto_nome || "Produto não identificado"}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {triagem.quantidade_total} unidades
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span className="text-sm">Tempo de triagem</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold">{tempoFormatado}</span>
                {pausado ? (
                  <Button size="sm" variant="outline" onClick={retomarTimer}>
                    Retomar
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={pausarTimer}>
                    Pausar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amostragem Estatística */}
        {mostrarAmostragem && triagem?.quantidade_total > 0 && (
          <AmostragemAutomatica
            quantidadeTotal={triagem.quantidade_total}
            onAmostraCalculada={(tamanho) => setTamanhoAmostra(tamanho)}
          />
        )}

        {/* Checklist de inspeção */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Checklist de Inspeção</CardTitle>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Object.values(checklist).filter(Boolean).length}/{checklistItems.length}</span>
              </div>
              <Progress value={progressoChecklist} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                  <Checkbox
                    id={item.id}
                    checked={checklist[item.id] || false}
                    onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {item.label}
                  </label>
                  {checklist[item.id] && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Defeitos do Produto */}
        {triagem?.produto_sku && mockHistoricoDefeitos[triagem.produto_sku] && (
          <DefeitoHistorico
            sku={triagem.produto_sku}
            produto={triagem.produto_nome || "Produto"}
            historico={mockHistoricoDefeitos[triagem.produto_sku].historico}
            totalTriagens={mockHistoricoDefeitos[triagem.produto_sku].totalTriagens}
          />
        )}


        {/* Fotos obrigatórias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImagePlus className="h-5 w-5" />
              Fotos do Lote
            </CardTitle>
            <CardDescription>
              Tire fotos do produto para documentação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FotosLoteObrigatorias
              loteId={id || ""}
              fotos={fotos}
              onFotoAdicionada={adicionarFoto}
              onFotoRemovida={removerFoto}
              loading={loadingFotos}
            />
          </CardContent>
        </Card>

        {/* Quantidades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resultado da Inspeção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Quantidade Aprovada</label>
                <input
                  type="number"
                  value={quantidadeAprovada}
                  onChange={(e) => setQuantidadeAprovada(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded text-lg font-bold text-center"
                  min={0}
                  max={triagem.quantidade_total}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Quantidade Reprovada</label>
                <input
                  type="number"
                  value={quantidadeReprovada}
                  onChange={(e) => setQuantidadeReprovada(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded text-lg font-bold text-center"
                  min={0}
                  max={triagem.quantidade_total}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground">Observações</label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Descreva qualquer problema ou observação..."
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => handleSubmit("reprovado")}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reprovar
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => handleSubmit("aprovado")}
            disabled={submitting || !todosItensVerificados()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Aprovar
          </Button>
        </div>

        {!todosItensVerificados() && (
          <p className="text-sm text-amber-500 text-center flex items-center justify-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Complete todos os itens do checklist para aprovar
          </p>
        )}
      </div>
    </AppLayout>
  );
}
