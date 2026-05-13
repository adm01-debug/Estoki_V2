import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ScannerOCR } from "@/components/scanner/ScannerOCR";
import { Package, FileText, MapPin, ArrowRight, RotateCcw, AlertCircle, Loader2, History } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { QRScanner } from "@/components/scanner/QRScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useScanner, ScanResult } from "@/hooks/useScanner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mapeamento de status para badges
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_triagem: { label: "Em Triagem", variant: "default" },
  aprovado: { label: "Aprovado", variant: "default" },
  reprovado: { label: "Reprovado", variant: "destructive" },
  armazenado: { label: "Armazenado", variant: "default" },
  livre: { label: "Livre", variant: "outline" },
  ocupado: { label: "Ocupado", variant: "default" },
  desconhecido: { label: "Desconhecido", variant: "secondary" },
};

// Mapeamento de tipo para ícones e cores
const tipoConfig: Record<string, { label: string; color: string }> = {
  recebimento: { label: "Recebimento", color: "text-blue-500" },
  triagem: { label: "Triagem", color: "text-amber-500" },
  lote: { label: "Lote", color: "text-green-500" },
  posicao: { label: "Posição", color: "text-purple-500" },
  desconhecido: { label: "Desconhecido", color: "text-gray-500" },
};

export default function ScannerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"qr" | "ocr">("qr");
  const {
    isScanning,
    isLoading,
    lastResult,
    scanHistory,
    error,
    processQRCode,
    clearLastResult,
    setScanning,
  } = useScanner();

  const handleScanSuccess = async (decodedText: string) => {
    const result = await processQRCode(decodedText);
    
    if (result) {
      toast({
        title: "QR Code lido com sucesso!",
        description: `${tipoConfig[result.tipo].label}: ${result.produto}`,
      });
    } else if (error) {
      toast({
        title: "Erro ao processar",
        description: error,
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (result: ScanResult) => {
    switch (result.tipo) {
      case 'recebimento':
        navigate(`/recebimento/${result.id}`);
        break;
      case 'triagem':
      case 'lote':
        navigate(`/triagem/${result.id}`);
        break;
      case 'posicao':
        navigate(`/estoque?posicao=${result.localizacao}`);
        break;
      default:
        toast({
          title: "Navegação não disponível",
          description: "Este tipo de item não possui página de detalhes",
          variant: "destructive",
        });
    }
  };

  const handleNewScan = () => {
    clearLastResult();
    setScanning(true);
  };

   return (
     <AppLayout title="Centro de Captura" showBack>
       <div className="p-4 md:p-8 space-y-8 max-w-[1200px] mx-auto">
         {/* Seletor de Modo */}
         <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded-2xl border border-border/20 max-w-sm mx-auto">
           <Button
             variant={mode === "qr" ? "default" : "ghost"}
             size="sm"
             onClick={() => setMode("qr")}
             className={cn(
               "flex-1 gap-2 h-10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
               mode === "qr" ? "glow-button" : "text-muted-foreground hover:bg-transparent hover:text-primary"
             )}
           >
             <Package className="h-4 w-4" />
             QR Code
           </Button>
           <Button
             variant={mode === "ocr" ? "default" : "ghost"}
             size="sm"
             onClick={() => setMode("ocr")}
             className={cn(
               "flex-1 gap-2 h-10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
               mode === "ocr" ? "glow-button" : "text-muted-foreground hover:bg-transparent hover:text-primary"
             )}
           >
             <FileText className="h-4 w-4" />
             OCR
           </Button>
         </div>

        {mode === "ocr" && <ScannerOCR />}

        {mode === "qr" && (
          <>
            {/* Scanner ativo */}
            {isScanning && !lastResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Scanner de QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <QRScanner
                      onScan={handleScanSuccess}
                      onError={(err) => {
                        toast({
                          title: "Erro no scanner",
                          description: err,
                          variant: "destructive",
                        });
                      }}
                    />
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Aponte a câmera para o QR Code do produto, lote ou posição
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading */}
            {isLoading && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Processando QR Code...</span>
                </CardContent>
              </Card>
            )}

             {/* Resultado do scan */}
             {lastResult && !isLoading && (
               <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden animate-in fade-in zoom-in-95">
                 <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                 <CardHeader className="pb-6 border-b border-primary/10">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className={cn("w-10 h-10 rounded-xl bg-background flex items-center justify-center border shadow-sm", tipoConfig[lastResult.tipo].color)}>
                         <Package className="h-5 w-5" />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-none mb-1">Tipo de Captura</p>
                         <CardTitle className="text-lg font-black tracking-tight">{tipoConfig[lastResult.tipo].label}</CardTitle>
                       </div>
                     </div>
                     <Badge className={cn(
                       "text-[10px] font-black uppercase tracking-widest px-2.5 rounded-full",
                       statusConfig[lastResult.status]?.variant === "destructive" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                     )}>
                       {statusConfig[lastResult.status]?.label || lastResult.status}
                     </Badge>
                   </div>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                   {/* Informações principais */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="space-y-1">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Produto / SKU</p>
                       <p className="text-base font-black text-foreground tracking-tight">{lastResult.produto}</p>
                     </div>
                     <div className="space-y-1">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Documento / Pedido</p>
                       <p className="text-base font-black text-foreground tracking-tight">{lastResult.pedido}</p>
                     </div>
                     {lastResult.lote && (
                       <div className="space-y-1">
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lote de Origem</p>
                         <p className="text-base font-black text-foreground tracking-tight">{lastResult.lote}</p>
                       </div>
                     )}
                     <div className="space-y-1">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quantidade Capturada</p>
                       <p className="text-2xl font-black text-primary tracking-tighter">{lastResult.quantidade} <span className="text-xs text-muted-foreground uppercase ml-1">unidades</span></p>
                     </div>
                     {lastResult.localizacao && (
                       <div className="col-span-full p-4 rounded-2xl bg-background/50 border border-border/40 flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                           <MapPin className="h-5 w-5" />
                         </div>
                         <div>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Localização no Armazém</p>
                           <p className="text-base font-black text-foreground tracking-tight">{lastResult.localizacao}</p>
                         </div>
                       </div>
                     )}
                   </div>

                  {/* Datas */}
                  {(lastResult.dataRecebimento || lastResult.dataTriagem || lastResult.dataArmazenamento) && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Histórico</p>
                      <div className="space-y-1 text-sm">
                        {lastResult.dataRecebimento && (
                          <p>Recebido: {format(new Date(lastResult.dataRecebimento), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        )}
                        {lastResult.dataTriagem && (
                          <p>Triado: {format(new Date(lastResult.dataTriagem), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        )}
                        {lastResult.dataArmazenamento && (
                          <p>Armazenado: {format(new Date(lastResult.dataArmazenamento), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        )}
                      </div>
                    </div>
                  )}

                   {/* Ações */}
                   <div className="flex gap-3 pt-6 border-t border-border/20">
                     <Button 
                       variant="outline" 
                       onClick={handleNewScan} 
                       className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-wider gap-2 hover:bg-primary/5 transition-all"
                     >
                       <RotateCcw className="h-4 w-4" /> Novo Scan
                     </Button>
                     {lastResult.tipo !== 'desconhecido' && (
                       <Button 
                         onClick={() => handleNavigate(lastResult)} 
                         className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-wider gap-2 glow-button"
                       >
                         Ver Detalhes <ArrowRight className="h-4 w-4" />
                       </Button>
                     )}
                   </div>
                 </CardContent>
               </Card>
             )}

            {/* Erro */}
            {error && !lastResult && !isLoading && (
              <Card className="border-destructive">
                <CardContent className="flex items-center gap-4 py-6">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium">Erro ao processar QR Code</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button variant="outline" onClick={handleNewScan}>
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Histórico de scans */}
            {scanHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5" />
                    Histórico de Scans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scanHistory.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => item.result && handleNavigate(item.result)}
                      >
                        <div className="flex items-center gap-3">
                          <Package className={cn(
                            "h-4 w-4",
                            item.result ? tipoConfig[item.result.tipo].color : "text-gray-500"
                          )} />
                          <div>
                            <p className="font-medium text-sm">
                              {item.result?.produto || 'Não encontrado'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(item.timestamp, "HH:mm:ss", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        {item.result && (
                          <Badge variant={statusConfig[item.result.status]?.variant || "secondary"} className="text-xs">
                            {statusConfig[item.result.status]?.label || item.result.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
