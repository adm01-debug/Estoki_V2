import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flashlight, Camera, Package, MapPin, ArrowRight, RotateCcw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScanResult {
  itemId: number;
  pedido: string;
  produto: string;
  lote: string;
  volume: number;
  totalVolumes: number;
  quantidade: number;
  localizacao: string;
  status: string;
  dataRecebimento: string;
  dataTriagem: string;
  dataArmazenamento: string;
}

// Mock de resultado de scan
const mockScanResult: ScanResult = {
  itemId: 12345,
  pedido: "2638-1",
  produto: "Mochila Executiva Preta",
  lote: "2638-1-XBZ-20251216",
  volume: 2,
  totalVolumes: 4,
  quantidade: 125,
  localizacao: "PP1-S05-N2",
  status: "Em estoque",
  dataRecebimento: "16/12/2025 14:30",
  dataTriagem: "16/12/2025 15:45",
  dataArmazenamento: "16/12/2025 16:30",
};

export default function ScannerPage() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{ time: string; pedido: string; volume: string; local: string }>>([
    { time: "16:45", pedido: "#2638-1 Vol 2/4", volume: "2/4", local: "PP1-S05-N2" },
    { time: "16:42", pedido: "#2639-2 Vol 1/3", volume: "1/3", local: "PP2-S03-N1" },
    { time: "16:38", pedido: "#2640-1 Vol 1/1", volume: "1/1", local: "BOX-08" },
  ]);

  // Simular scan após 2 segundos
  const simulateScan = () => {
    setTimeout(() => {
      setScanResult(mockScanResult);
      setIsScanning(false);
      setRecentScans((prev) => [
        { time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), pedido: `#${mockScanResult.pedido} Vol ${mockScanResult.volume}/${mockScanResult.totalVolumes}`, volume: `${mockScanResult.volume}/${mockScanResult.totalVolumes}`, local: mockScanResult.localizacao },
        ...prev.slice(0, 2),
      ]);
    }, 2000);
  };

  const handleNewScan = () => {
    setScanResult(null);
    setIsScanning(true);
    simulateScan();
  };

  // Iniciar simulação de scan ao montar
  useState(() => {
    if (isScanning) {
      simulateScan();
    }
  });

  return (
    <AppLayout
      title="Scanner"
      showBack
      rightAction={
        <Button
          size="icon"
          variant={flashOn ? "default" : "outline"}
          onClick={() => setFlashOn(!flashOn)}
        >
          <Flashlight className="h-4 w-4" />
        </Button>
      }
    >
      <div className="p-4 lg:pl-72 space-y-4 animate-fade-in">
        {/* Área de Scan ou Resultado */}
        {isScanning && !scanResult ? (
          <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden">
            {/* Simulação de câmera */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Quadro de scan */}
                <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                  {/* Cantos destacados */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                  
                  {/* Linha de scan animada */}
                  <div className="absolute left-4 right-4 h-0.5 bg-primary animate-pulse" style={{ top: "50%" }} />
                  
                  {/* Ícone central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-16 w-16 text-white/30" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Texto de instrução */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/80 text-sm">
                Aponte a câmera para o QR Code da etiqueta
              </p>
            </div>
          </div>
        ) : scanResult ? (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-2 text-success mb-4">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                ✓
              </div>
              <span className="font-semibold">QR CODE LIDO</span>
            </div>

            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-primary">
                📦 VOLUME {scanResult.volume}/{scanResult.totalVolumes}
              </span>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-2 mb-4">
              <InfoRow label="Pedido" value={`#${scanResult.pedido}`} />
              <InfoRow label="Produto" value={scanResult.produto} />
              <InfoRow label="Lote" value={scanResult.lote} />
              <InfoRow label="Quantidade" value={`~${scanResult.quantidade} un`} />
              <div className="border-t border-border pt-2 mt-2">
                <InfoRow 
                  label="📍 Localização" 
                  value={scanResult.localizacao} 
                  highlight 
                />
                <InfoRow 
                  label="Status" 
                  value={`✅ ${scanResult.status}`} 
                  highlight 
                />
              </div>
              <div className="border-t border-border pt-2 mt-2 text-xs text-muted-foreground">
                <div>Recebido: {scanResult.dataRecebimento}</div>
                <div>Triagem: {scanResult.dataTriagem}</div>
                <div>Armazenado: {scanResult.dataArmazenamento}</div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">AÇÕES RÁPIDAS:</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="flex-col h-auto py-3 gap-1">
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Ver Completo</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-3 gap-1">
                  <ArrowRight className="h-5 w-5" />
                  <span className="text-xs">Mover</span>
                </Button>
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
        ) : null}

        {/* Histórico de Scans */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            📋 ÚLTIMOS ESCANEADOS:
          </h4>
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
                </div>
                <span className="text-sm text-muted-foreground">{scan.local}</span>
              </div>
            ))}
          </div>
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
