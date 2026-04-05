import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CameraOff, RotateCcw, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, []);

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Prefer back camera
        const backCamera = devices.find(
          (d) => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("traseira")
        );
        setCurrentCamera(backCamera?.id || devices[0].id);
        setHasPermission(true);
        return devices;
      } else {
        setError("Nenhuma câmera encontrada");
        setHasPermission(false);
        return [];
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Erro ao obter câmeras:", err);
      setError("Permissão de câmera negada");
      setHasPermission(false);
      onError?.("Permissão de câmera negada");
      return [];
    }
  };

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      setError(null);
      
      // Get cameras if not already loaded
      let cameraId = currentCamera;
      if (!cameraId) {
        const devices = await getCameras();
        if (devices.length === 0) return;
        cameraId = devices[0].id;
      }

      // Initialize scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      // Start scanning
      await scannerRef.current.start(
        cameraId!,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // On successful scan
          onScan(decodedText);
          // Optionally stop after scan
          // stopScanner();
        },
        (errorMessage) => {
          // Ignore scan errors (no QR found is not an error)
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error("Erro ao iniciar scanner:", err);
      const msg = err instanceof Error ? err.message : "Erro ao iniciar câmera";
      setError(msg);
      onError?.(msg);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        if (import.meta.env.DEV) console.error("Erro ao parar scanner:", err);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length < 2) return;

    const currentIndex = cameras.findIndex((c) => c.id === currentCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    if (isScanning) {
      await stopScanner();
      setCurrentCamera(nextCamera.id);
      setTimeout(() => startScanner(), 100);
    } else {
      setCurrentCamera(nextCamera.id);
    }
  };

  const handleStartClick = async () => {
    if (isScanning) {
      await stopScanner();
    } else {
      await startScanner();
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Scanner Container */}
      <div 
        className="relative bg-black rounded-2xl overflow-hidden aspect-square"
      >
        {/* QR Reader Element */}
        <div 
          id="qr-reader" 
          ref={containerRef}
          className="w-full h-full"
        />

        {/* Overlay when not scanning */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            {error ? (
              <div className="text-center p-4">
                <CameraOff className="h-16 w-16 text-destructive mx-auto mb-4" />
                <p className="text-white mb-2">{error}</p>
                <Button onClick={handleStartClick} variant="outline" className="mt-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="text-center p-4">
                <Camera className="h-16 w-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 mb-4">Clique para iniciar a câmera</p>
                <Button onClick={handleStartClick} size="lg" className="gap-2">
                  <Camera className="h-5 w-5" />
                  Iniciar Scanner
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Scanning overlay with frame */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              
              {/* Scanning line animation */}
              <div className="absolute left-4 right-4 h-0.5 bg-primary animate-pulse" style={{ top: '50%' }} />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {isScanning && (
        <div className="flex justify-center gap-3 mt-4">
          {cameras.length > 1 && (
            <Button variant="outline" size="icon" onClick={switchCamera}>
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
          <Button variant="destructive" onClick={handleStartClick} className="gap-2">
            <CameraOff className="h-5 w-5" />
            Parar Scanner
          </Button>
        </div>
      )}

      {/* Instructions */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        {isScanning 
          ? "Aponte a câmera para o QR Code da etiqueta" 
          : "Toque para ativar a câmera e escanear"}
      </p>
    </div>
  );
}
