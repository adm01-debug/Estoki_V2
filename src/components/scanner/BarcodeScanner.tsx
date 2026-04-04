import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect(source: HTMLVideoElement | ImageBitmap | HTMLCanvasElement): Promise<Array<{ rawValue: string; format: string }>>;
    };
  }
}
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, Flashlight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BarcodeScannerProps {
  onScan: (code: string, format?: string) => void;
  onError?: (error: Error) => void;
  formats?: string[];
  className?: string;
  autoStart?: boolean;
}

// BarcodeDetector API polyfill check
const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

export function BarcodeScanner({
  onScan,
  onError,
  formats = ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'],
  className,
  autoStart = false,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(autoStart);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<{ detect(source: HTMLVideoElement | ImageBitmap | HTMLCanvasElement): Promise<Array<{ rawValue: string; format: string }>> } | null>(null);
  const animationRef = useRef<number | null>(null);

  const initBarcodeDetector = useCallback(async () => {
    if (hasBarcodeDetector) {
      try {
        detectorRef.current = new window.BarcodeDetector!({ formats });
      } catch (err) {
        if (import.meta.env.DEV) console.warn("BarcodeDetector not supported");
        setError('Scanner não suportado neste dispositivo');
      }
    } else {
      // Fallback: use ZXing library or manual input
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        detectorRef.current = new BrowserMultiFormatReader();
      } catch {
        setError('Biblioteca de scanner não disponível');
      }
    }
  }, [formats]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for flash capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      setHasFlash(!!capabilities?.torch);

      setIsScanning(true);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError('Não foi possível acessar a câmera');
      onError?.(error);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsScanning(false);
    setFlashOn(false);
  }, []);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !hasFlash) return;

    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !flashOn }] as any,
      });
      setFlashOn(!flashOn);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Flash toggle failed:", err);
    }
  }, [flashOn, hasFlash]);

  const detectBarcode = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || !isScanning) return;

    try {
      if (hasBarcodeDetector) {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          onScan(barcode.rawValue, barcode.format);
          stopCamera();
          return;
        }
      } else if (canvasRef.current) {
        // ZXing fallback
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);

          const result = await detectorRef.current.decodeFromCanvas(canvas);
          if (result) {
            onScan(result.getText(), result.getBarcodeFormat());
            stopCamera();
            return;
          }
        }
      }
    } catch (err) {
      // Continue scanning
    }

    animationRef.current = requestAnimationFrame(detectBarcode);
  }, [isScanning, onScan, stopCamera]);

  useEffect(() => {
    initBarcodeDetector();
    return () => stopCamera();
  }, [initBarcodeDetector, stopCamera]);

  useEffect(() => {
    if (isScanning && detectorRef.current) {
      detectBarcode();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isScanning, detectBarcode]);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
  }, [autoStart, startCamera]);

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={startCamera}>Tentar novamente</Button>
        </div>
      ) : isScanning ? (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-auto"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-primary rounded-lg animate-pulse" />
          </div>

          {/* Controls */}
          <div className="absolute top-2 right-2 flex gap-2">
            {hasFlash && (
              <Button
                size="icon"
                variant={flashOn ? 'default' : 'secondary'}
                onClick={toggleFlash}
              >
                <Flashlight className="h-4 w-4" />
              </Button>
            )}
            <Button size="icon" variant="destructive" onClick={stopCamera}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <Camera className="h-12 w-12 text-muted-foreground mb-4" />
          <Button onClick={startCamera}>Iniciar Scanner</Button>
        </div>
      )}
    </Card>
  );
}

export default BarcodeScanner;
