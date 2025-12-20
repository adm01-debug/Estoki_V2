import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface BalancaConfig {
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
}

export interface LeituraBalanca {
  peso: number;
  unidade: 'kg' | 'g' | 'lb';
  estavel: boolean;
  timestamp: Date;
  raw: string;
}

const defaultConfig: BalancaConfig = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none'
};

function parseBalancaData(raw: string): LeituraBalanca | null {
  const data = raw.trim();
  const patterns = [
    /([SU]T),([GN]S),\s*([\d.]+)\s*(kg|g|lb)/i,
    /^\s*([\d.]+)\s*(kg|g|lb)\s*$/i,
    /^\s*([\d.]+)\s*$/
  ];
  
  for (const pattern of patterns) {
    const match = data.match(pattern);
    if (match) {
      const estavel = match[1] === 'ST' || !match[2] || match[2] === 'GS';
      const pesoStr = match[3] || match[1];
      const unidade = (match[4] || match[2] || 'kg').toLowerCase() as 'kg' | 'g' | 'lb';
      const peso = parseFloat(pesoStr);
      if (!isNaN(peso)) {
        return { peso, unidade, estavel, timestamp: new Date(), raw: data };
      }
    }
  }
  return null;
}

export function useBalanca() {
  const [conectada, setConectada] = useState(false);
  const [leitura, setLeitura] = useState<LeituraBalanca | null>(null);
  const [historico, setHistorico] = useState<LeituraBalanca[]>([]);
  const [config, setConfig] = useState<BalancaConfig>(defaultConfig);
  const [erro, setErro] = useState<string | null>(null);
  
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  
  const suportado = 'serial' in navigator;
  
  const lerDados = useCallback(async (reader: ReadableStreamDefaultReader) => {
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value);
        const linhas = buffer.split(/[\r\n]+/);
        buffer = linhas.pop() || '';
        for (const linha of linhas) {
          if (linha.trim()) {
            const leituraData = parseBalancaData(linha);
            if (leituraData) setLeitura(leituraData);
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'CanceledError') {
        setErro('Conexão perdida');
      }
    }
  }, []);
  
  const desconectar = useCallback(async () => {
    try {
      if (readerRef.current) { await readerRef.current.cancel(); readerRef.current = null; }
      if (portRef.current) { await portRef.current.close(); portRef.current = null; }
      setConectada(false);
      setLeitura(null);
      toast.info('Balança desconectada');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }, []);
  
  const conectar = useCallback(async (configCustom?: Partial<BalancaConfig>) => {
    if (!suportado) {
      setErro('Web Serial API não suportada');
      toast.error('Navegador não suporta conexão serial');
      return false;
    }
    const cfg = { ...config, ...configCustom };
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: cfg.baudRate, dataBits: cfg.dataBits, stopBits: cfg.stopBits, parity: cfg.parity, flowControl: cfg.flowControl });
      portRef.current = port;
      setConectada(true);
      setErro(null);
      setConfig(cfg);
      const reader = port.readable?.getReader();
      if (reader) { readerRef.current = reader; lerDados(reader); }
      toast.success('Balança conectada');
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setErro(msg);
      toast.error(`Erro: ${msg}`);
      return false;
    }
  }, [config, suportado, lerDados]);
  
  const capturarPeso = useCallback(() => {
    if (!leitura) { toast.error('Nenhuma leitura'); return null; }
    if (!leitura.estavel) { toast.warning('Aguarde estabilização'); return null; }
    setHistorico(prev => [...prev, leitura]);
    toast.success(`Peso: ${leitura.peso} ${leitura.unidade}`);
    return leitura;
  }, [leitura]);
  
  const enviarComando = useCallback(async (cmd: string) => {
    if (!portRef.current?.writable) return false;
    try {
      const writer = portRef.current.writable.getWriter();
      await writer.write(new TextEncoder().encode(cmd + '\r\n'));
      writer.releaseLock();
      return true;
    } catch { return false; }
  }, []);
  
  const tara = useCallback(() => enviarComando('T'), [enviarComando]);
  const zero = useCallback(() => enviarComando('Z'), [enviarComando]);
  
  const simularLeitura = useCallback((peso?: number) => {
    const p = peso ?? parseFloat((Math.random() * 100).toFixed(3));
    setLeitura({ peso: p, unidade: 'kg', estavel: true, timestamp: new Date(), raw: `ST,GS,${p}kg` });
    setConectada(true);
  }, []);
  
  useEffect(() => { return () => { desconectar(); }; }, [desconectar]);
  
  return { suportado, conectada, leitura, historico, config, erro, conectar, desconectar, capturarPeso, tara, zero, simularLeitura, setConfig };
}
