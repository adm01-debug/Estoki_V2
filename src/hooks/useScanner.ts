import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ScanResult {
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

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData?: {
    pedido?: string;
    lote?: string;
    quantidade?: number;
    produto?: string;
  };
}

export interface ScanHistoryItem {
  qrData: string;
  result: ScanResult | null;
  timestamp: Date;
  source?: 'qr' | 'ocr';
}

export interface UseScannerReturn {
  // Estado
  isScanning: boolean;
  isLoading: boolean;
  lastResult: ScanResult | null;
  scanHistory: ScanHistoryItem[];
  error: string | null;
  ocrResult: OCRResult | null;
  
  // Ações
  processQRCode: (qrData: string) => Promise<ScanResult | null>;
  processImageOCR: (imageBase64: string) => Promise<OCRResult | null>;
  clearLastResult: () => void;
  clearHistory: () => void;
  setScanning: (value: boolean) => void;
}

export function useScanner(): UseScannerReturn {
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  // Processar imagem com OCR via Edge Function
  const processImageOCR = useCallback(async (imageBase64: string): Promise<OCRResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('scanner-ocr', {
        body: { 
          image: imageBase64,
          extractData: true 
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao processar OCR');
      }

      if (!data) {
        throw new Error('Nenhum resultado do OCR');
      }

      const result: OCRResult = {
        text: data.text || '',
        confidence: data.confidence || 0,
        extractedData: data.extractedData || {}
      };

      setOcrResult(result);

      // Se encontrou dados estruturados, tentar processar como QR
      if (result.extractedData?.pedido || result.extractedData?.lote) {
        const qrData = JSON.stringify(result.extractedData);
        const scanResult = await processQRCode(qrData);
        
        if (scanResult) {
          setScanHistory(prev => [
            { qrData, result: scanResult, timestamp: new Date(), source: 'ocr' },
            ...prev.slice(0, 9)
          ]);
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar OCR';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processQRCode = useCallback(async (qrData: string): Promise<ScanResult | null> => {
    setIsLoading(true);
    setError(null);

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

      if (!parsed) {
        setError("QR Code não reconhecido");
        return null;
      }

      let result: ScanResult | null = null;

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
          const posicoes = lote.estoque_posicao || [];
          const localizacao = posicoes.length > 0 
            ? posicoes.map((p: { posicoes_estoque?: { codigo?: string } }) => p.posicoes_estoque?.codigo).filter(Boolean).join(', ')
            : undefined;

          result = {
            id: lote.id,
            pedido: lote.pedido_compra || 'N/A',
            produto: lote.produtos?.nome || 'Produto desconhecido',
            lote: lote.numero_lote,
            quantidade: lote.quantidade_atual || 0,
            localizacao,
            status: lote.status || 'pendente',
            dataRecebimento: lote.data_recebimento,
            dataTriagem: lote.data_conferencia ?? undefined,
            tipo: 'lote',
          };
        }
      }

      // Se tem código de posição, buscar posição
      if (!result && (parsed.posicao || parsed.codigo_posicao)) {
        const codigoPosicao = (parsed.posicao || parsed.codigo_posicao) as string;
        const { data: posicao } = await supabase
          .from('posicoes_estoque')
          .select(`
            *,
            estoque_posicao (
              quantidade,
              lotes (
                numero_pedido,
                numero_lote,
                produtos (nome)
              )
            )
          `)
          .eq('codigo', codigoPosicao)
          .maybeSingle();

        if (posicao) {
          const estoque = posicao.estoque_posicao || [];
          const qtdTotal = estoque.reduce((acc: number, e: any) => acc + (e.quantidade || 0), 0);
          const produtos = estoque.map((e: { lotes?: { produtos?: { nome?: string } } }) => e.lotes?.produtos?.nome).filter(Boolean);

          result = {
            id: posicao.id,
            pedido: 'Posição',
            produto: produtos.length > 0 ? produtos.join(', ') : 'Vazia',
            localizacao: posicao.codigo,
            quantidade: qtdTotal,
            status: posicao.status || 'livre',
            tipo: 'posicao',
          };
        }
      }

      // Se tem pedido, buscar recebimento
      if (!result && parsed.pedido) {
        const { data: recebimentos } = await supabase
          .from('lotes')
          .select(`
            *,
            produtos (nome, sku)
          `)
          .eq('pedido_compra', parsed.pedido as string)
          .limit(5);

        if (recebimentos && recebimentos.length > 0) {
          const primeiro = recebimentos[0];
          result = {
            id: primeiro.id,
            pedido: primeiro.pedido_compra || 'N/A',
            produto: primeiro.produtos?.nome || 'Produto desconhecido',
            lote: primeiro.numero_lote,
            volume: 1,
            totalVolumes: recebimentos.length,
            quantidade: recebimentos.reduce((acc, r) => acc + (r.quantidade_atual || 0), 0),
            status: primeiro.status || 'pendente',
            dataRecebimento: primeiro.data_recebimento,
            tipo: 'recebimento',
          };
        }
      }

      if (!result) {
        result = {
          id: 'unknown',
          pedido: qrData,
          produto: 'Não encontrado no sistema',
          quantidade: 0,
          status: 'desconhecido',
          tipo: 'desconhecido',
        };
      }

      setLastResult(result);
      setScanHistory(prev => [
        { qrData, result, timestamp: new Date(), source: 'qr' },
        ...prev.slice(0, 9) // Manter últimos 10
      ]);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar QR Code';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLastResult = useCallback(() => {
    setLastResult(null);
    setOcrResult(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
  }, []);

  const setScanning = useCallback((value: boolean) => {
    setIsScanning(value);
    if (value) {
      setLastResult(null);
      setOcrResult(null);
      setError(null);
    }
  }, []);

  return {
    isScanning,
    isLoading,
    lastResult,
    scanHistory,
    error,
    ocrResult,
    processQRCode,
    processImageOCR,
    clearLastResult,
    clearHistory,
    setScanning,
  };
}
