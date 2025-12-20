import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTriagens } from "@/hooks/useTriagens";
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Camera,
  Clock
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
  
  const [triagem, setTriagem] = useState<any>(null);
  const [loadingTriagem, setLoadingTriagem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const loadTriagem = async () => {
      if (!id) return;
      setLoadingTriagem(true);
      const data = await getTriagemById(id);
      if (data) {
        setTriagem(data);
      }
      setLoadingTriagem(false);
    };
    loadTriagem();
  }, [id]);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [itemId]: checked }));
  };

  const checklistCompleto = checklistItems.every(item => checklist[item.id]);
  const checklistProgresso = (Object.values(checklist).filter(Boolean).length / checklistItems.length) * 100;

  const handleAprovar = async () => {
    if (!id) return;
    setSubmitting(true);
    const success = await finalizarTriagem(id, {
      resultado: 'aprovado',
      observacoes,
    });
    setSubmitting(false);
    if (success) {
      toast({ title: "Triagem Aprovada! ✅" });
      navigate("/triagem");
    }
  };

  const handleReprovar = async () => {
    if (!id) return;
    setSubmitting(true);
    const success = await finalizarTriagem(id, {
      resultado: 'reprovado',
      observacoes,
    });
    setSubmitting(false);
    if (success) {
      toast({ title: "Triagem Reprovada ❌" });
      navigate("/triagem");
    }
  };

  if (loadingTriagem) {
    return (
      <AppLayout title="Triagem" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

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
    <AppLayout title="Formulário de Triagem" showBack>
      <div className="p-4 lg:pl-72 space-y-4 pb-32">
        {/* Info do Produto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Produto</p>
                <p className="font-medium">{triagem.produto_nome || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data Início</p>
                <p className="font-medium">{new Date(triagem.data_inicio).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Checklist de Inspeção</span>
              <Badge variant={checklistCompleto ? "default" : "secondary"}>
                {Object.values(checklist).filter(Boolean).length}/{checklistItems.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={checklistProgresso} className="h-2" />
            <div className="space-y-3">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <Checkbox
                    id={item.id}
                    checked={checklist[item.id] || false}
                    onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                  />
                  <label htmlFor={item.id} className="flex-1 cursor-pointer text-sm">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione observações sobre a triagem..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:pl-72">
          <div className="flex gap-3 max-w-screen-lg mx-auto">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReprovar}
              disabled={submitting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reprovar
            </Button>
            <Button
              className="flex-1"
              onClick={handleAprovar}
              disabled={!checklistCompleto || submitting}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
