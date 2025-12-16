import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Camera, 
  Image as ImageIcon, 
  X, 
  Tag, 
  CheckCircle, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Package
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GeradorEtiquetas } from "@/components/etiquetas/GeradorEtiquetas";
import type { TipoEmbalagem } from "@/types/estoque";

// Dados mockados do pedido
const mockPedido = {
  id: 1,
  pedido: "2638-1",
  fornecedor: "XBZ Brindes",
  nf: "12345",
  produto: "Mochila Executiva Preta",
  sku: "MOCH-EXEC-PRT",
  qtdPedida: 500,
};

interface FormData {
  qtdVolumes: number;
  qtdPorVolume: number;
  tipoEmbalagem: TipoEmbalagem;
  descricaoVolumes: string;
  qtdRecebida: number;
  fotos: string[];
  observacao: string;
}

export default function ConferenciaRecebimento() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    qtdVolumes: 4,
    qtdPorVolume: 125,
    tipoEmbalagem: "original",
    descricaoVolumes: "",
    qtdRecebida: 500,
    fotos: [],
    observacao: "",
  });

  const [showEtiquetaModal, setShowEtiquetaModal] = useState(false);
  const [showDivergenciaModal, setShowDivergenciaModal] = useState(false);

  // Cálculos de divergência
  const divergencia = formData.qtdRecebida - mockPedido.qtdPedida;
  const percentualDivergencia = ((formData.qtdRecebida / mockPedido.qtdPedida) * 100) - 100;
  
  const getDivergenciaStatus = () => {
    if (divergencia === 0) return { status: "ok", color: "text-success", bg: "bg-success/10", icon: Minus, label: "OK" };
    if (divergencia > 0) return { status: "excesso", color: "text-info", bg: "bg-info/10", icon: ArrowUp, label: "Excesso" };
    return { status: "falta", color: "text-destructive", bg: "bg-destructive/10", icon: ArrowDown, label: "Falta" };
  };

  const divStatus = getDivergenciaStatus();

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (formData.fotos.length >= 5) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormData((prev) => ({
              ...prev,
              fotos: [...prev.fotos, event.target!.result as string],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  };

  const handleConfirmarOK = () => {
    if (divergencia !== 0) {
      setShowDivergenciaModal(true);
      return;
    }
    
    toast({
      title: "Conferência confirmada!",
      description: `Recebimento #${mockPedido.pedido} confirmado com sucesso.`,
    });
    navigate("/recebimento");
  };

  const handleConfirmarComDivergencia = () => {
    setShowDivergenciaModal(false);
    toast({
      title: "Divergência registrada",
      description: `Recebimento #${mockPedido.pedido} registrado com divergência de ${divergencia > 0 ? "+" : ""}${divergencia} unidades.`,
      variant: divergencia < 0 ? "destructive" : "default",
    });
    navigate("/recebimento");
  };

  // Dados para o gerador de etiquetas
  const etiquetaData = {
    pedido: mockPedido.pedido,
    produto: mockPedido.produto,
    lote: `${mockPedido.pedido}-XBZ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
    fornecedor: mockPedido.fornecedor,
    totalVolumes: formData.qtdVolumes,
    qtdPorVolume: formData.qtdPorVolume,
    dataRecebimento: new Date(),
  };

  return (
    <AppLayout title={`Conferência #${mockPedido.pedido}`} showBack>
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in pb-24">
        {/* Dados do Pedido */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            DADOS DO PEDIDO
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoRow label="Pedido" value={mockPedido.pedido} />
            <InfoRow label="Fornecedor" value={mockPedido.fornecedor} />
            <InfoRow label="NF" value={mockPedido.nf} />
            <InfoRow label="SKU" value={mockPedido.sku || "-"} />
            <div className="col-span-2">
              <InfoRow label="Produto" value={mockPedido.produto} />
            </div>
            <div className="col-span-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Qtd Pedida:</span>
                <span className="text-xl font-bold text-primary">{mockPedido.qtdPedida} un</span>
              </div>
            </div>
          </div>
        </section>

        {/* Volumes Recebidos */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            📦 VOLUMES RECEBIDOS
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qtdVolumes" className="text-xs text-muted-foreground">
                  Qtd Volumes (caixas)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="qtdVolumes"
                    type="number"
                    min={1}
                    value={formData.qtdVolumes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, qtdVolumes: parseInt(e.target.value) || 1 }))}
                    className="text-lg font-semibold"
                  />
                  <span className="text-2xl">📦</span>
                </div>
              </div>
              <div>
                <Label htmlFor="qtdPorVolume" className="text-xs text-muted-foreground">
                  Qtd por Volume (média)
                </Label>
                <Input
                  id="qtdPorVolume"
                  type="number"
                  min={1}
                  value={formData.qtdPorVolume}
                  onChange={(e) => setFormData((prev) => ({ ...prev, qtdPorVolume: parseInt(e.target.value) || 1 }))}
                  className="text-lg font-semibold"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tipoEmbalagem" className="text-xs text-muted-foreground">
                Tipo Embalagem
              </Label>
              <Select
                value={formData.tipoEmbalagem}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, tipoEmbalagem: v as TipoEmbalagem }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">📦 Original do Fornecedor</SelectItem>
                  <SelectItem value="plastica">🛍️ Embalagem Plástica</SelectItem>
                  <SelectItem value="generica">📋 Caixa Genérica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricaoVolumes" className="text-xs text-muted-foreground">
                Descrição dos Volumes
              </Label>
              <Textarea
                id="descricaoVolumes"
                placeholder="Ex: 3 caixas XBZ + 1 plástica verde"
                value={formData.descricaoVolumes}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricaoVolumes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Cálculo automático */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Cálculo estimado:</span>
                <span className="font-medium">
                  {formData.qtdVolumes} × {formData.qtdPorVolume} = {formData.qtdVolumes * formData.qtdPorVolume} un
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Conferência */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            ✅ CONFERÊNCIA
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="qtdRecebida" className="text-xs text-muted-foreground">
                Quantidade Recebida (contagem real)
              </Label>
              <Input
                id="qtdRecebida"
                type="number"
                min={0}
                value={formData.qtdRecebida}
                onChange={(e) => setFormData((prev) => ({ ...prev, qtdRecebida: parseInt(e.target.value) || 0 }))}
                className="text-2xl font-bold h-14"
              />
            </div>

            {/* Indicador de Divergência */}
            <div className={cn(
              "rounded-xl p-4 flex items-center justify-between",
              divStatus.bg
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", divStatus.bg)}>
                  <divStatus.icon className={cn("h-5 w-5", divStatus.color)} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Divergência</div>
                  <div className={cn("text-2xl font-bold", divStatus.color)}>
                    {divergencia > 0 && "+"}{divergencia} un
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-3xl font-bold", divStatus.color)}>
                  {percentualDivergencia > 0 && "+"}{percentualDivergencia.toFixed(1)}%
                </div>
                <div className={cn("text-sm font-medium", divStatus.color)}>
                  {divStatus.label}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fotos */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            📸 FOTOS (opcional)
          </h3>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex gap-2 mb-3">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handleAddPhoto}
              disabled={formData.fotos.length >= 5}
            >
              <Camera className="h-4 w-4" />
              Tirar Foto
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handleAddPhoto}
              disabled={formData.fotos.length >= 5}
            >
              <ImageIcon className="h-4 w-4" />
              Galeria
            </Button>
          </div>

          {formData.fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {formData.fotos.map((foto, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.fotos.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhuma foto adicionada
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Máximo 5 fotos. Fotos ajudam a documentar o recebimento.
          </p>
        </section>

        {/* Observação */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <Label htmlFor="observacao" className="text-sm font-semibold text-muted-foreground mb-2 block">
            📝 OBSERVAÇÕES
          </Label>
          <Textarea
            id="observacao"
            placeholder="Observações adicionais sobre o recebimento..."
            value={formData.observacao}
            onChange={(e) => setFormData((prev) => ({ ...prev, observacao: e.target.value }))}
            rows={3}
          />
        </section>

        {/* Ações Fixas */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:pl-72">
          <div className="max-w-7xl mx-auto flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12 gap-2"
              onClick={() => setShowEtiquetaModal(true)}
            >
              <Tag className="h-5 w-5" />
              Gerar Etiquetas
            </Button>
            <Button 
              className={cn(
                "flex-1 h-12 gap-2",
                divergencia !== 0 && "bg-warning hover:bg-warning/90"
              )}
              onClick={handleConfirmarOK}
            >
              {divergencia === 0 ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Confirmar OK
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  Registrar Divergência
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Modal de Divergência */}
        <Dialog open={showDivergenciaModal} onOpenChange={setShowDivergenciaModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Divergência Detectada
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Foi detectada uma divergência entre a quantidade pedida e a quantidade recebida:
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Qtd Pedida:</span>
                  <span className="font-bold">{mockPedido.qtdPedida} un</span>
                </div>
                <div className="flex justify-between">
                  <span>Qtd Recebida:</span>
                  <span className="font-bold">{formData.qtdRecebida} un</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span>Divergência:</span>
                  <span className={cn("font-bold", divStatus.color)}>
                    {divergencia > 0 && "+"}{divergencia} un ({percentualDivergencia > 0 && "+"}{percentualDivergencia.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm">Justificativa (obrigatório)</Label>
                <Textarea placeholder="Descreva o motivo da divergência..." rows={3} />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowDivergenciaModal(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-warning hover:bg-warning/90" onClick={handleConfirmarComDivergencia}>
                  Confirmar Divergência
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Etiquetas com QR Code Real */}
        <GeradorEtiquetas
          open={showEtiquetaModal}
          onOpenChange={setShowEtiquetaModal}
          data={etiquetaData}
        />
      </div>
    </AppLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}:</span>
      <div className="font-medium">{value}</div>
    </div>
  );
}
