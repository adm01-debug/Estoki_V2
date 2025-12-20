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

export interface ScanHistoryItem {
  qrData: string;
  result: ScanResult | null;
  timestamp: Date;
}

export interface UseScannerReturn {
  // Estado
  isScanning: boolean;
  isLoading: boolean;
  lastResult: ScanResult | null;
  scanHistory: ScanHistoryItem[];
  error: string | null;
  
  // Ações
  processQRCode: (qrData: string) => Promise<ScanResult | null>;
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
            ? posicoes.map((p: any) => p.posicoes_estoque?.codigo).filter(Boolean).join(', ')
            : undefined;

          result = {
            id: lote.id,
            pedido: lote.numero_pedido || 'N/A',
            produto: lote.produtos?.nome || 'Produto desconhecido',
            lote: lote.numero_lote,
            quantidade: lote.quantidade_total || 0,
            localizacao,
            status: lote.status_triagem || 'pendente',
            dataRecebimento: lote.data_recebimento,
            dataTriagem: lote.data_triagem,
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
          const produtos = estoque.map((e: any) => e.lotes?.produtos?.nome).filter(Boolean);

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
          .eq('numero_pedido', parsed.pedido as string)
          .limit(5);

        if (recebimentos && recebimentos.length > 0) {
          const primeiro = recebimentos[0];
          result = {
            id: primeiro.id,
            pedido: primeiro.numero_pedido || 'N/A',
            produto: primeiro.produtos?.nome || 'Produto desconhecido',
            lote: primeiro.numero_lote,
            volume: 1,
            totalVolumes: recebimentos.length,
            quantidade: recebimentos.reduce((acc, r) => acc + (r.quantidade_total || 0), 0),
            status: primeiro.status_triagem || 'pendente',
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
        { qrData, result, timestamp: new Date() },
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
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
  }, []);

  const setScanning = useCallback((value: boolean) => {
    setIsScanning(value);
    if (value) {
      setLastResult(null);
      setError(null);
    }
  }, []);

  return {
    isScanning,
    isLoading,
    lastResult,
    scanHistory,
    error,
    processQRCode,
    clearLastResult,
    clearHistory,
    setScanning,
  };
}
