import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EtiquetaData, TamanhoEtiqueta, tamanhos } from "./types";
import { generateEtiquetasPDF } from "./pdfGenerator";
import { EtiquetaPreview } from "./EtiquetaPreview";

interface GeradorEtiquetasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: EtiquetaData;
}

export function GeradorEtiquetas({ open, onOpenChange, data }: GeradorEtiquetasProps) {
  const { toast } = useToast();
  
  const [qtdEtiquetas, setQtdEtiquetas] = useState(data.totalVolumes);
  const [tamanho, setTamanho] = useState<TamanhoEtiqueta>("10x7");
  const [qrCodeUrls, setQrCodeUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewVolume, setPreviewVolume] = useState(1);

  useEffect(() => {
    const generateQRCodes = async () => {
      const urls: string[] = [];
      
      for (let i = 1; i <= qtdEtiquetas; i++) {
        const qrData = JSON.stringify({
          pedido: data.pedido,
          lote: data.lote,
          volume: i,
          totalVolumes: qtdEtiquetas,
          url: `https://app.promobrindes.com.br/estoque/item/${data.pedido}?vol=${i}`,
        });
        
        try {
          const url = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 1,
            color: { dark: "#000000", light: "#ffffff" },
          });
          urls.push(url);
        } catch (err) {
          if (import.meta.env.DEV) console.error("Erro ao gerar QR Code:", err);
        }
      }
      setQrCodeUrls(urls);
    };

    if (open) {
      generateQRCodes();
    }
  }, [open, qtdEtiquetas, data]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const fileName = await generateEtiquetasPDF(data, qtdEtiquetas, tamanho, qrCodeUrls);
      toast({
        title: "PDF gerado com sucesso!",
        description: `${qtdEtiquetas} etiqueta(s) salva(s) em ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    await handleGeneratePDF();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏷️ Gerar Etiquetas QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="font-medium">Pedido: #{data.pedido}</div>
            <div className="text-muted-foreground truncate">{data.produto}</div>
            <div className="text-xs text-muted-foreground mt-1">Lote: {data.lote}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qtdEtiquetas" className="text-xs">Quantidade</Label>
              <Input
                id="qtdEtiquetas"
                type="number"
                min={1}
                max={50}
                value={qtdEtiquetas}
                onChange={(e) => setQtdEtiquetas(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div>
              <Label className="text-xs">Tamanho</Label>
              <Select value={tamanho} onValueChange={(v) => setTamanho(v as TamanhoEtiqueta)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tamanhos)
                    .filter(([key]) => key !== "10x15")
                    .map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {qtdEtiquetas > 1 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs">Visualizar volume:</Label>
              <Select 
                value={previewVolume.toString()} 
                onValueChange={(v) => setPreviewVolume(parseInt(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: qtdEtiquetas }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} / {qtdEtiquetas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <EtiquetaPreview 
            data={data}
            tamanho={tamanho}
            qrCodeUrl={qrCodeUrls[previewVolume - 1]}
            currentVolume={previewVolume}
            totalVolumes={qtdEtiquetas}
          />

          <p className="text-xs text-muted-foreground text-center">
            Serão geradas {qtdEtiquetas} etiqueta(s) no tamanho {tamanhos[tamanho]?.label}
          </p>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handleGeneratePDF}
              disabled={isGenerating || qrCodeUrls.length === 0}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Baixar PDF
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={handlePrint}
              disabled={isGenerating || qrCodeUrls.length === 0}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
