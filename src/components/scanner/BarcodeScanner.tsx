import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Não foi possível acessar a câmera");
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // TODO: Implementar detecção de barcode com BarcodeDetector API ou biblioteca

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white font-medium">Escanear código</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6 text-white" />
        </Button>
      </div>
      {error ? (
        <div className="flex-1 flex items-center justify-center text-white">{error}</div>
      ) : (
        <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
      )}
      <div className="p-4">
        <p className="text-white text-center text-sm">Aponte a câmera para o código de barras</p>
      </div>
    </div>
  );
}
