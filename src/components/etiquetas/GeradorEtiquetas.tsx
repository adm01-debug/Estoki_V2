import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Download, Printer, Eye, Loader2 } from "lucide-react";
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

interface EtiquetaData {
  pedido: string;
  produto: string;
  lote: string;
  fornecedor: string;
  totalVolumes: number;
  qtdPorVolume: number;
  dataRecebimento: Date;
}

interface GeradorEtiquetasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: EtiquetaData;
}

type TamanhoEtiqueta = "10x7" | "8x5";

const tamanhos: Record<TamanhoEtiqueta, { width: number; height: number; label: string }> = {
  "10x7": { width: 100, height: 70, label: "10 x 7 cm" },
  "8x5": { width: 80, height: 50, label: "8 x 5 cm" },
};

export function GeradorEtiquetas({ open, onOpenChange, data }: GeradorEtiquetasProps) {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [qtdEtiquetas, setQtdEtiquetas] = useState(data.totalVolumes);
  const [tamanho, setTamanho] = useState<TamanhoEtiqueta>("10x7");
  const [qrCodeUrls, setQrCodeUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewVolume, setPreviewVolume] = useState(1);

  // Gerar QR Codes quando os dados mudam
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
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          urls.push(url);
        } catch (err) {
          console.error("Erro ao gerar QR Code:", err);
        }
      }
      
      setQrCodeUrls(urls);
    };

    if (open) {
      generateQRCodes();
    }
  }, [open, qtdEtiquetas, data]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const { width, height } = tamanhos[tamanho];
      const doc = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "mm",
        format: [width, height],
      });

      for (let i = 0; i < qtdEtiquetas; i++) {
        if (i > 0) {
          doc.addPage([width, height]);
        }

        // Fundo branco
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, width, height, "F");

        // Header azul
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, width, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("ESTOKI - ESTOQUE", width / 2, 5.5, { align: "center" });

        // Reset cor do texto
        doc.setTextColor(0, 0, 0);

        // Informações do pedido
        const startY = 12;
        const leftMargin = 4;
        const lineHeight = 4;

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(`PEDIDO: ${data.pedido}`, leftMargin, startY);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        
        // Truncar produto se necessário
        const maxProductLength = tamanho === "10x7" ? 35 : 25;
        const truncatedProduct = data.produto.length > maxProductLength 
          ? data.produto.substring(0, maxProductLength) + "..." 
          : data.produto;
        doc.text(`PRODUTO: ${truncatedProduct}`, leftMargin, startY + lineHeight);
        doc.text(`LOTE: ${data.lote}`, leftMargin, startY + lineHeight * 2);

        // QR Code
        const qrSize = tamanho === "10x7" ? 25 : 18;
        const qrX = leftMargin;
        const qrY = startY + lineHeight * 3 + 2;

        if (qrCodeUrls[i]) {
          doc.addImage(qrCodeUrls[i], "PNG", qrX, qrY, qrSize, qrSize);
        }

        // Informações ao lado do QR
        const infoX = qrX + qrSize + 4;
        const infoY = qrY + 3;
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(`📦 VOLUME: ${i + 1}/${qtdEtiquetas}`, infoX, infoY);
        
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(`📊 QTD: ~${data.qtdPorVolume} un`, infoX, infoY + 5);
        doc.text(`📅 ${formatDate(data.dataRecebimento)}`, infoX, infoY + 10);

        // Rodapé
        const footerY = height - 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, footerY - 2, width - leftMargin, footerY - 2);
        
        doc.setFontSize(6);
        doc.text(`FORNECEDOR: ${data.fornecedor}`, leftMargin, footerY + 1);
        doc.text(`ENDEREÇO: PP__-S__-N__`, leftMargin, footerY + 5);
      }

      // Salvar PDF
      const fileName = `etiquetas_${data.pedido}_${Date.now()}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF gerado com sucesso!",
        description: `${qtdEtiquetas} etiqueta(s) salva(s) em ${fileName}`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
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
    await generatePDF();
    // O usuário pode imprimir o PDF baixado
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
          {/* Info do pedido */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <div className="font-medium">Pedido: #{data.pedido}</div>
            <div className="text-muted-foreground truncate">{data.produto}</div>
            <div className="text-xs text-muted-foreground mt-1">Lote: {data.lote}</div>
          </div>

          {/* Configurações */}
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
                  {Object.entries(tamanhos).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seletor de volume para preview */}
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

          {/* Preview da Etiqueta */}
          <div className="border border-border rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              PRÉVIA DA ETIQUETA
            </div>
            
            <div 
              ref={previewRef}
              className="border-2 border-dashed border-border rounded-lg overflow-hidden"
              style={{ 
                aspectRatio: `${tamanhos[tamanho].width} / ${tamanhos[tamanho].height}`,
                maxWidth: "100%",
              }}
            >
              {/* Header */}
              <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold">
                PROMO BRINDES - ESTOQUE
              </div>
              
              {/* Conteúdo */}
              <div className="p-3 text-xs space-y-1">
                <div className="font-bold">PEDIDO: {data.pedido}</div>
                <div className="truncate text-muted-foreground">PRODUTO: {data.produto}</div>
                <div className="text-muted-foreground">LOTE: {data.lote}</div>
                
                <div className="flex items-start gap-3 pt-2">
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    {qrCodeUrls[previewVolume - 1] ? (
                      <img 
                        src={qrCodeUrls[previewVolume - 1]} 
                        alt="QR Code" 
                        className="w-16 h-16 border border-border rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="space-y-1 pt-1">
                    <div className="font-bold">📦 VOLUME: {previewVolume}/{qtdEtiquetas}</div>
                    <div>📊 QTD: ~{data.qtdPorVolume} un</div>
                    <div>📅 {formatDate(data.dataRecebimento)}</div>
                  </div>
                </div>
                
                {/* Rodapé */}
                <div className="pt-2 mt-2 border-t border-border space-y-0.5 text-muted-foreground">
                  <div>FORNECEDOR: {data.fornecedor}</div>
                  <div>ENDEREÇO: PP__-S__-N__</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Serão geradas {qtdEtiquetas} etiqueta(s) no tamanho {tamanhos[tamanho].label}
          </p>

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={generatePDF}
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
