/**
 * Hook de Leitura de Código de Barras
 * Suporta leitores USB, câmera e input manual
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type BarcodeFormat = 
  | 'EAN13' | 'EAN8' | 'UPC_A' | 'UPC_E' 
  | 'CODE128' | 'CODE39' | 'CODE93'
  | 'ITF' | 'CODABAR' | 'QR_CODE' | 'DATA_MATRIX';

export interface BarcodeResult {
  code: string;
  format: BarcodeFormat | 'unknown';
  timestamp: Date;
  source: 'scanner' | 'camera' | 'manual';
}

export interface UseBarcodeOptions {
  onScan: (result: BarcodeResult) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  minLength?: number;
  maxLength?: number;
  scanTimeout?: number;
  allowedFormats?: BarcodeFormat[];
  dedupInterval?: number;
}

// Detectar formato do código
function detectFormat(code: string): BarcodeFormat | 'unknown' {
  if (/^[0-9]{13}$/.test(code)) return 'EAN13';
  if (/^[0-9]{8}$/.test(code)) return 'EAN8';
  if (/^[0-9]{12}$/.test(code)) return 'UPC_A';
  if (/^[0-9]{7,8}$/.test(code) && code.startsWith('0')) return 'UPC_E';
  if (/^[A-Z0-9\-\.\ \$\/\+\%]+$/.test(code)) return 'CODE39';
  if (/^[0-9]+$/.test(code) && code.length % 2 === 0) return 'ITF';
  if (/^[\x00-\x7F]+$/.test(code)) return 'CODE128';
  return 'unknown';
}

// Validar EAN13 (checksum)
function validateEAN13(code: string): boolean {
  if (!/^[0-9]{13}$/.test(code)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(code[12]) === checkDigit;
}

// Hook principal para leitura USB/teclado
export function useBarcodeScanner(options: UseBarcodeOptions) {
  const {
    onScan,
    onError,
    enabled = true,
    minLength = 4,
    maxLength = 50,
    scanTimeout = 100,
    allowedFormats,
    dedupInterval = 500,
  } = options;

  const bufferRef = useRef('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastScanRef = useRef<{ code: string; time: number } | null>(null);

  const processBuffer = useCallback(() => {
    const code = bufferRef.current.trim();
    bufferRef.current = '';

    if (code.length < minLength || code.length > maxLength) {
      return;
    }

    // Deduplicação
    const now = Date.now();
    if (
      lastScanRef.current &&
      lastScanRef.current.code === code &&
      now - lastScanRef.current.time < dedupInterval
    ) {
      return;
    }
    lastScanRef.current = { code, time: now };

    // Detectar formato
    const format = detectFormat(code);

    // Validar formato permitido
    if (allowedFormats && !allowedFormats.includes(format as BarcodeFormat)) {
      onError?.(new Error(`Formato não permitido: ${format}`));
      return;
    }

    // Validar EAN13
    if (format === 'EAN13' && !validateEAN13(code)) {
      onError?.(new Error('Código EAN13 inválido'));
      return;
    }

    onScan({
      code,
      format,
      timestamp: new Date(),
      source: 'scanner',
    });
  }, [minLength, maxLength, dedupInterval, allowedFormats, onScan, onError]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar se estiver em input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Enter processa o buffer
      if (event.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          processBuffer();
        }
        return;
      }

      // Apenas caracteres imprimíveis
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        bufferRef.current += event.key;

        // Reset timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(processBuffer, scanTimeout);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, processBuffer, scanTimeout]);

  // Função para scan manual
  const manualScan = useCallback((code: string) => {
    const format = detectFormat(code);
    
    onScan({
      code: code.trim(),
      format,
      timestamp: new Date(),
      source: 'manual',
    });
  }, [onScan]);

  return { manualScan };
}

// Hook para leitura via câmera (usa BarcodeDetector API)
export function useCameraScanner(options: UseBarcodeOptions) {
  const { onScan, onError, enabled = true } = options;
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // @ts-ignore - BarcodeDetector é experimental
    setIsSupported('BarcodeDetector' in window);
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported || !videoRef.current) {
      onError?.(new Error('BarcodeDetector não suportado'));
      return;
    }

    try {
      // Obter stream da câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // @ts-ignore
      detectorRef.current = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code'],
      });

      setIsScanning(true);

      // Loop de detecção
      const detect = async () => {
        if (!videoRef.current || !detectorRef.current) return;

        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          
          if (barcodes.length > 0) {
            const barcode = barcodes[0];
            onScan({
              code: barcode.rawValue,
              format: detectFormat(barcode.rawValue),
              timestamp: new Date(),
              source: 'camera',
            });
          }
        } catch (e) {
          // Ignorar erros de detecção
        }

        animationRef.current = requestAnimationFrame(detect);
      };

      detect();
    } catch (error) {
      onError?.(error as Error);
    }
  }, [isSupported, onScan, onError]);

  const stopScanning = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    videoRef,
    isSupported,
    isScanning,
    startScanning,
    stopScanning,
  };
}

export default useBarcodeScanner;
