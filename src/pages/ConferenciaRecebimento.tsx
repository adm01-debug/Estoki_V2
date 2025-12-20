import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Check, AlertTriangle, Package, Loader2, Clock, Truck, Info } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRecebimentos, Recebimento, StatusRecebimento } from "@/hooks/useRecebimentos";
import { Progress } from "@/components/ui/progress";

type TipoEmbalagem = "original" | "plastica" | "generica";

const statusConfig: Record<StatusRecebimento, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "bg-muted" },
  em_transito: { label: "Em Trânsito", color: "bg-blue-500" },
  recebido: { label: "Recebido", color: "bg-yellow-500" },
  em_conferencia: { label: "Em Conferência", color: "bg-orange-500" },
  conferido: { label: "Conferido", color: "bg-green-500" },
  divergencia: { label: "Divergência", color: "bg-red-500" },
  cancelado: { label: "Cancelado", color: "bg-destructive" },
};

export default function ConferenciaRecebimentoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecebimentoById, confirmarConferencia, atualizarStatus } = useRecebimentos();

  const [recebimento, setRecebimento] = useState<Recebimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    qtdRecebida: 0,
    qtdVolumes: 1,
    qtdPorVolume: 0,
    tipoEmbalagem: "original" as TipoEmbalagem,
    descricaoVolumes: "",
    observacoes: "",
  });

  useEffect(() => {
    const loadRecebimento = async () => {
      if (!id) return;
      
      setLoading(true);
      const data = await getRecebimentoById(id);
      
      if (data) {
        setRecebimento(data);
        const qtdPedida = data.quantidade_pedida || data.quantidade_inicial;
        setFormData({
          qtdRecebida: data.quantidade_atual || qtdPedida,
          qtdVolumes: 1,
          qtdPorVolume: qtdPedida,
          tipoEmbalagem: "original",
          descricaoVolumes: "",
          observacoes: data.observacoes_conferencia || "",
        });
      } else {
        toast({
          title: "Erro",
          description: "Recebimento não encontrado",
          variant: "destructive",
        });
        navigate("/recebimento");
      }
      
      setLoading(false);
    };

    loadRecebimento();
  }, [id, getRecebimentoById, navigate, toast]);

  const qtdPedida = recebimento?.quantidade_pedida || recebimento?.quantidade_inicial || 0;
  const divergencia = formData.qtdRecebida - qtdPedida;
  const percentualDivergencia = qtdPedida > 0 
    ? ((formData.qtdRecebida / qtdPedida) * 100) - 100 
    : 0;
  const percentualRecebido = qtdPedida > 0 
    ? Math.min((formData.qtdRecebida / qtdPedida) * 100, 100)
    : 0;

  const handleSubmit = async () => {
    if (!id || !recebimento) return;

    setSubmitting(true);
    
    const success = await confirmarConferencia(
      id,
      formData.qtdRecebida,
      formData.observacoes
    );

    if (success) {
      navigate("/recebimento");
    }
    
    setSubmitting(false);
  };

  const handleIniciarConferencia = async () => {
    if (!id) return;
    await atualizarStatus(id, 'em_conferencia');
    const data = await getRecebimentoById(id);
    if (data) setRecebimento(data);
  };

  if (loading) {
    return (
      <AppLayout title="Conferência" showBack>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!recebimento) {
    return (
      <AppLayout title="Conferência" showBack>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Recebimento não encontrado</p>
        </div>
      </AppLayout>
    );
  }

  const status = statusConfig[recebimento.status];

  return (
    <AppLayout title={`Conferência - Lote ${recebimento.numero_lote}`} showBack>
      <div className="p-4 lg:pl-72 space-y-6 animate-fade-in max-w-2xl mx-auto">
        {/* Cabeçalho do Pedido */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold">{recebimento.produto_nome}</h2>
                <Badge className={`${status.color} text-white`}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{recebimento.fornecedor}</p>
              {recebimento.nf_entrada && (
                <p className="text-xs text-muted-foreground mt-1">NF: {recebimento.nf_entrada}</p>
              )}
              {recebimento.pedido_compra && (
                <p className="text-xs text-muted-foreground">Pedido: {recebimento.pedido_compra}</p>
              )}
            </div>
          </div>

          {/* Info de quantidades */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Pedida</p>
                <p className="text-lg font-bold">{qtdPedida}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inicial</p>
                <p className="text-lg font-bold">{recebimento.quantidade_inicial}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Atual</p>
                <p className="text-lg font-bold">{recebimento.quantidade_atual}</p>
              </div>
            </div>
            {recebimento.previsao_chegada && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Previsão: {new Date(recebimento.previsao_chegada).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botão para iniciar conferência se ainda não iniciada */}
        {recebimento.status === 'recebido' && (
          <Button 
            onClick={handleIniciarConferencia} 
            className="w-full gap-2"
            size="lg"
          >
            <Truck className="h-5 w-5" />
            Iniciar Conferência
          </Button>
        )}

        {/* Formulário de Conferência */}
        {(recebimento.status === 'em_conferencia' || recebimento.status === 'divergencia') && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qtdRecebida">Quantidade Recebida *</Label>
                <Input
                  id="qtdRecebida"
                  type="number"
                  value={formData.qtdRecebida}
                  onChange={(e) =>
                    setFormData({ ...formData, qtdRecebida: parseInt(e.target.value) || 0 })
                  }
                  className="text-lg font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label>Divergência</Label>
                <div
                  className={`h-10 px-3 rounded-md flex items-center justify-center text-sm font-medium ${
                    divergencia === 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : divergencia > 0
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {divergencia === 0 ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> OK
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {divergencia > 0 ? "+" : ""}
                      {divergencia} ({percentualDivergencia.toFixed(1)}%)
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso da conferência</span>
                <span className="font-medium">{percentualRecebido.toFixed(0)}%</span>
              </div>
              <Progress value={percentualRecebido} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qtdVolumes">Nº de Volumes</Label>
                <Input
                  id="qtdVolumes"
                  type="number"
                  min={1}
                  value={formData.qtdVolumes}
                  onChange={(e) =>
                    setFormData({ ...formData, qtdVolumes: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qtdPorVolume">Qtd por Volume</Label>
                <Input
                  id="qtdPorVolume"
                  type="number"
                  value={formData.qtdPorVolume}
                  onChange={(e) =>
                    setFormData({ ...formData, qtdPorVolume: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoEmbalagem">Tipo de Embalagem</Label>
              <Select
                value={formData.tipoEmbalagem}
                onValueChange={(value: TipoEmbalagem) =>
                  setFormData({ ...formData, tipoEmbalagem: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original do Fornecedor</SelectItem>
                  <SelectItem value="plastica">Caixa Plástica</SelectItem>
                  <SelectItem value="generica">Caixa Genérica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoVolumes">Descrição dos Volumes</Label>
              <Input
                id="descricaoVolumes"
                placeholder="Ex: 4 caixas de 125 unidades cada"
                value={formData.descricaoVolumes}
                onChange={(e) =>
                  setFormData({ ...formData, descricaoVolumes: e.target.value })
                }
              />
            </div>

            {/* Fotos */}
            <div className="space-y-2">
              <Label>Fotos do Recebimento</Label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">Foto {i}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre o recebimento..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/recebimento")}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Confirmar Conferência
              </Button>
            </div>
          </div>
        )}

        {/* Visualização para status conferido ou outros */}
        {(recebimento.status === 'conferido' || recebimento.status === 'aguardando' || recebimento.status === 'em_transito') && (
          <div className="bg-muted/50 rounded-xl p-6 text-center">
            <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {recebimento.status === 'conferido' && 'Este recebimento já foi conferido.'}
              {recebimento.status === 'aguardando' && 'Aguardando chegada do material.'}
              {recebimento.status === 'em_transito' && 'Material em trânsito.'}
            </p>
            {recebimento.data_conferencia && (
              <p className="text-sm text-muted-foreground mt-2">
                Conferido em: {new Date(recebimento.data_conferencia).toLocaleString("pt-BR")}
              </p>
            )}
            {recebimento.observacoes_conferencia && (
              <p className="text-sm mt-2 p-3 bg-background rounded-lg">
                {recebimento.observacoes_conferencia}
              </p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
