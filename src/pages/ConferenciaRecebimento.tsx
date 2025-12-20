import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Check, AlertTriangle, Package, Loader2 } from "lucide-react";
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
import { useRecebimentos, Recebimento } from "@/hooks/useRecebimentos";

type TipoEmbalagem = "original" | "plastica" | "generica";

export default function ConferenciaRecebimentoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRecebimentoById } = useRecebimentos();

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
        setFormData({
          qtdRecebida: data.quantidade_atual || data.quantidade_inicial,
          qtdVolumes: 1,
          qtdPorVolume: data.quantidade_inicial,
          tipoEmbalagem: "original",
          descricaoVolumes: "",
          observacoes: "",
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

  const divergencia = recebimento ? formData.qtdRecebida - recebimento.quantidade_inicial : 0;
  const percentualDivergencia = recebimento 
    ? ((formData.qtdRecebida / recebimento.quantidade_inicial) * 100) - 100 
    : 0;

  const handleSubmit = async () => {
    if (!id || !recebimento) return;

    setSubmitting(true);
    
    // In a real implementation, this would update the lote
    toast({
      title: "Conferência finalizada",
      description: `Lote ${recebimento.numero_lote} conferido com sucesso`,
    });

    navigate("/recebimento");
    
    setSubmitting(false);
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
              <h2 className="font-semibold">{recebimento.produto_nome}</h2>
              <p className="text-sm text-muted-foreground">{recebimento.fornecedor}</p>
              {recebimento.nf_entrada && (
                <p className="text-xs text-muted-foreground mt-1">NF: {recebimento.nf_entrada}</p>
              )}
            </div>
            <Badge variant="outline" className="shrink-0">
              {recebimento.quantidade_inicial} un
            </Badge>
          </div>
        </div>

        {/* Formulário de Conferência */}
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
    </AppLayout>
  );
}
