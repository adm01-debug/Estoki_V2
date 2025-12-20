import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, MapPin, ArrowRight, RotateCcw, AlertCircle, Loader2, History } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { QRScanner } from "@/components/scanner/QRScanner";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScanResult {
  id: string;
  pedido: string;
  produto: string;
  lote?: string;
  volume?: number;
  totalVolumes?: number;
  quantidade: number;
  localizacao?: string;
  status: string;
  dataRecebimento?: string;
  dataTriagem?: string;
  dataArmazenamento?: string;
  tipo: 'recebimento' | 'triagem' | 'lote' | 'posicao' | 'desconhecido';
}

// Busca real no Supabase
const fetchItemData = async (qrData: string): Promise<ScanResult | null> => {
  try {
    // Tentar parsear como JSON (QR codes gerados pelo sistema)
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      // Se não for JSON, tentar extrair pedido da string
      const pedidoMatch = qrData.match(/([0-9]+-[0-9]+)/);
      if (pedidoMatch) {
        parsed = { pedido: pedidoMatch[1] };
      }
    }

    if (!parsed) return null;

    // Se tem ID de lote, buscar lote
    if (parsed.lote_id || parsed.loteId) {
      const { data: lote } = await supabase
        .from('lotes')
        .select(`
          *,
          produtos (nome, sku),
          estoque_posicao (
            posicao_id,
            quantidade,
            posicoes_estoque (codigo)
          )
        `)
        .eq('id', (parsed.lote_id || parsed.loteId) as string)
        .maybeSingle();

      if (lote) {
        const estoquePosicao = lote.estoque_posicao as Array<{
          posicao_id: string;
          quantidade: number;
          posicoes_estoque: { codigo: string } | null;
        }> | null;
        
        return {
          id: lote.id,
          pedido: lote.numero_lote || 'N/A',
          produto: (lote.produtos as { nome: string; sku: string } | null)?.nome || 'Produto',
          lote: lote.numero_lote,
          quantidade: lote.quantidade_atual || 0,
          localizacao: estoquePosicao?.[0]?.posicoes_estoque?.codigo || 'Não alocado',
          status: 'Em estoque',
          tipo: 'lote',
        };
      }
    }

    // Se tem código de posição
    if (parsed.posicao || parsed.codigo) {
      const codigo = (parsed.posicao || parsed.codigo) as string;
      const { data: posicao } = await supabase
        .from('posicoes_estoque')
        .select(`
          *,
          estoque_posicao (
            quantidade,
            produtos (nome, sku)
          )
        `)
        .eq('codigo', codigo)
        .maybeSingle();

      if (posicao) {
        const estoquePosicao = posicao.estoque_posicao as Array<{
          quantidade: number;
          produtos: { nome: string; sku: string } | null;
        }> | null;
        
        return {
          id: posicao.id,
          pedido: 'Posição',
          produto: estoquePosicao?.[0]?.produtos?.nome || 'Vazia',
          quantidade: estoquePosicao?.[0]?.quantidade || 0,
          localizacao: posicao.codigo,
          status: posicao.status,
          tipo: 'posicao',
        };
      }
    }

    // Buscar em lotes pelo número
    if (parsed.numero_lote || parsed.lote) {
      const numeroLote = (parsed.numero_lote || parsed.lote) as string;
      const { data: lote } = await supabase
        .from('lotes')
        .select(`
          *,
          produtos (nome, sku)
        `)
        .eq('numero_lote', numeroLote)
        .maybeSingle();

      if (lote) {
        return {
          id: lote.id,
          pedido: lote.numero_lote,
          produto: (lote.produtos as { nome: string; sku: string } | null)?.nome || 'Produto',
          lote: lote.numero_lote,
          quantidade: lote.quantidade_atual,
          status: 'Em estoque',
          dataRecebimento: lote.data_recebimento,
          tipo: 'lote',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return null;
  }
};

export default function ScannerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [rawScanData, setRawScanData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentScans, setRecentScans] = useState<Array<{ time: string; pedido: string; local: string; tipo: string }>>([]);

  const handleScan = useCallback(async (data: string) => {
    // Evitar processar o mesmo código múltiplas vezes seguidas
    if (data === rawScanData || isLoading) return;
    
    setRawScanData(data);
    setIsLoading(true);
    
    const itemData = await fetchItemData(data);
    
    setIsLoading(false);
    
    if (itemData) {
      setScanResult(itemData);
      
      // Adicionar ao histórico
      setRecentScans((prev) => [
        {
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          pedido: itemData.pedido,
          local: itemData.localizacao || itemData.status,
          tipo: itemData.tipo,
        },
        ...prev.slice(0, 4),
      ]);

      // Feedback sonoro/vibração
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      toast({
        title: "QR Code lido!",
        description: `${itemData.tipo.toUpperCase()}: ${itemData.pedido}`,
      });
    } else {
      toast({
        title: "Item não encontrado",
        description: "QR Code não corresponde a nenhum item no sistema",
        variant: "destructive",
      });
    }
  }, [rawScanData, isLoading, toast]);

  const handleScanError = useCallback((error: string) => {
    toast({
      title: "Erro no scanner",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const handleNewScan = () => {
    setScanResult(null);
    setRawScanData(null);
  };

  const getActionsByTipo = (tipo: string, id: string) => {
    switch (tipo) {
      case 'lote':
        return (
          <>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate(`/recebimento/${id}`)}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs">Ver Lote</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/triagem")}
            >
              <ArrowRight className="h-5 w-5" />
              <span className="text-xs">Triagem</span>
            </Button>
          </>
        );
      case 'posicao':
        return (
          <>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/movimentacao")}
            >
              <ArrowRight className="h-5 w-5" />
              <span className="text-xs">Mover</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/rastreabilidade")}
            >
              <History className="h-5 w-5" />
              <span className="text-xs">Histórico</span>
            </Button>
          </>
        );
      default:
        return (
          <>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/movimentacao")}
            >
              <ArrowRight className="h-5 w-5" />
              <span className="text-xs">Mover</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate("/rastreabilidade")}
            >
              <History className="h-5 w-5" />
              <span className="text-xs">Histórico</span>
            </Button>
          </>
        );
    }
  };

  return (
    <AppLayout title="Scanner" showBack>
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Scanner ou Resultado */}
        {!scanResult ? (
          <>
            {isLoading ? (
              <div className="bg-card rounded-2xl p-12 border border-border flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Buscando item...</p>
              </div>
            ) : (
              <QRScanner onScan={handleScan} onError={handleScanError} />
            )}
          </>
        ) : (
          <div className="bg-card rounded-2xl p-6 border border-border animate-fade-in">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                ✓
              </div>
              <span className="font-semibold">ITEM ENCONTRADO</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-auto">
                {scanResult.tipo.toUpperCase()}
              </span>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-2 mb-4">
              <InfoRow label="Pedido/Código" value={scanResult.pedido} />
              <InfoRow label="Produto" value={scanResult.produto} />
              {scanResult.lote && <InfoRow label="Lote" value={scanResult.lote} />}
              <InfoRow label="Quantidade" value={`${scanResult.quantidade} un`} />
              {scanResult.totalVolumes && (
                <InfoRow label="Volumes" value={`${scanResult.volume || '-'}/${scanResult.totalVolumes}`} />
              )}
              <div className="border-t border-border pt-2 mt-2">
                {scanResult.localizacao && (
                  <InfoRow label="📍 Localização" value={scanResult.localizacao} highlight />
                )}
                <InfoRow label="Status" value={scanResult.status} highlight />
              </div>
              {(scanResult.dataRecebimento || scanResult.dataTriagem || scanResult.dataArmazenamento) && (
                <div className="border-t border-border pt-2 mt-2 text-xs text-muted-foreground">
                  {scanResult.dataRecebimento && (
                    <div>Recebido: {new Date(scanResult.dataRecebimento).toLocaleString("pt-BR")}</div>
                  )}
                  {scanResult.dataTriagem && (
                    <div>Triagem: {new Date(scanResult.dataTriagem).toLocaleString("pt-BR")}</div>
                  )}
                  {scanResult.dataArmazenamento && (
                    <div>Armazenado: {new Date(scanResult.dataArmazenamento).toLocaleString("pt-BR")}</div>
                  )}
                </div>
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">AÇÕES RÁPIDAS:</h4>
              <div className="grid grid-cols-3 gap-2">
                {getActionsByTipo(scanResult.tipo, scanResult.id)}
                <Button className="flex-col h-auto py-3 gap-1">
                  <MapPin className="h-5 w-5" />
                  <span className="text-xs">Separar</span>
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 gap-2"
              onClick={handleNewScan}
            >
              <RotateCcw className="h-4 w-4" />
              Escanear Outro
            </Button>
          </div>
        )}

        {/* Histórico de Scans */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            📋 ÚLTIMOS ESCANEADOS:
          </h4>
          {recentScans.length > 0 ? (
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-lg",
                    i === 0 ? "bg-primary/5" : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{scan.time}</span>
                    <span className="font-medium">{scan.pedido}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">{scan.tipo}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{scan.local}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum scan realizado ainda</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className={cn("font-medium", highlight && "text-primary")}>{value}</span>
    </div>
  );
}
