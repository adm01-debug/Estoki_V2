import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload, FileText, Loader2, Copy, Check, RotateCcw } from 'lucide-react';

interface OCRResult {
  tipo_documento: string;
  textos_extraidos: string[];
  dados_estruturados: {
    numero_documento?: string;
    data?: string;
    cnpj?: string;
    valor_total?: number;
    itens?: Array<{ descricao: string; quantidade: number; valor: number }>;
    codigos?: string[];
  };
  confianca: number;
}

export function ScannerOCR() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setLoading(true);
    setResult(null);

    try {
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Enviar para OCR
      const formData = new FormData();
      formData.append('image', file);

      const { data, error } = await supabase.functions.invoke('scanner-ocr', {
        body: formData,
      });

      if (error) throw error;

      if (data.success) {
        setResult(data);
        toast.success('Imagem processada com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao processar imagem');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro no OCR: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copiado!');
  };

  const reset = () => {
    setResult(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getTipoDocumentoBadge = (tipo: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      nf: { label: 'Nota Fiscal', variant: 'default' },
      etiqueta: { label: 'Etiqueta', variant: 'secondary' },
      codigo_barras: { label: 'Código de Barras', variant: 'outline' },
      outro: { label: 'Documento', variant: 'outline' },
    };
    const config = configs[tipo] || configs.outro;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        {!result && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Camera Input */}
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-8 w-8" />
                <span>Tirar Foto</span>
              </Button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* File Input */}
              <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8" />
                <span>Selecionar Arquivo</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Tire uma foto ou selecione uma imagem de nota fiscal, etiqueta ou código de barras
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processando imagem com IA...</p>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-4 max-h-40 rounded-lg opacity-50"
              />
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {getTipoDocumentoBadge(result.tipo_documento)}
                <Badge variant="outline">{result.confianca}% confiança</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Nova leitura
              </Button>
            </div>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Imagem processada"
                className="w-full max-h-48 object-contain rounded-lg bg-muted"
              />
            )}

            {/* Dados Estruturados */}
            {result.dados_estruturados && Object.keys(result.dados_estruturados).length > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-sm font-medium">Dados Identificados:</p>
                  
                  {result.dados_estruturados.numero_documento && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Nº Documento:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.dados_estruturados.numero_documento!)}
                      >
                        {result.dados_estruturados.numero_documento}
                        {copied ? <Check className="h-3 w-3 ml-2" /> : <Copy className="h-3 w-3 ml-2" />}
                      </Button>
                    </div>
                  )}

                  {result.dados_estruturados.cnpj && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">CNPJ:</span>
                      <span className="font-mono text-sm">{result.dados_estruturados.cnpj}</span>
                    </div>
                  )}

                  {result.dados_estruturados.valor_total && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Valor Total:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(result.dados_estruturados.valor_total)}
                      </span>
                    </div>
                  )}

                  {result.dados_estruturados.codigos && result.dados_estruturados.codigos.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Códigos:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {result.dados_estruturados.codigos.map((codigo, i) => (
                          <Badge key={i} variant="secondary" className="font-mono">
                            {codigo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Textos Extraídos */}
            {result.textos_extraidos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Textos Extraídos:</p>
                <ScrollArea className="h-32 rounded-lg border p-2">
                  {result.textos_extraidos.map((texto, i) => (
                    <p key={i} className="text-sm py-1 border-b last:border-0">
                      {texto}
                    </p>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
