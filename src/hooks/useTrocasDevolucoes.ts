import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Note: There's no 'trocas_devolucoes' table in the schema.
// This hook provides a mock implementation for the UI to work.

export type TipoRegistro = 'troca' | 'devolucao';
export type StatusRegistro = 'aberto' | 'em_analise' | 'aprovado' | 'recusado' | 'em_transito' | 'recebido' | 'finalizado';
export type MotivoTD = 'defeito' | 'cor_errada' | 'tamanho_errado' | 'quantidade_errada' | 'produto_errado' | 'avaria_transporte' | 'desistencia' | 'outro';

export interface TrocaDevolucao {
  id: string;
  tipo: TipoRegistro;
  pedido: string;
  cliente: string;
  fornecedor?: string;
  produto: string;
  sku?: string;
  quantidade: number;
  valor_unitario?: number;
  valor_total?: number;
  motivo: MotivoTD;
  descricao_problema?: string;
  fotos?: string[];
  status: StatusRegistro;
  data_abertura: string;
  data_analise?: string;
  data_resolucao?: string;
  aberto_por?: string;
  analisado_por?: string;
  resolucao?: string;
  credito_gerado?: boolean;
  valor_credito?: number;
  created_at: string;
  updated_at: string;
}

export interface TrocaDevolucaoInput {
  tipo: TipoRegistro;
  pedido: string;
  cliente: string;
  fornecedor?: string;
  produto: string;
  sku?: string;
  quantidade: number;
  valor_unitario?: number;
  motivo: MotivoTD;
  descricao_problema?: string;
  fotos?: string[];
}

// Mock data for demonstration
const mockRegistros: TrocaDevolucao[] = [
  {
    id: '1',
    tipo: 'devolucao',
    pedido: 'PED-2024-001',
    cliente: 'Cliente Exemplo',
    fornecedor: 'Fornecedor ABC',
    produto: 'Produto Teste',
    sku: 'SKU-001',
    quantidade: 10,
    valor_unitario: 25.00,
    valor_total: 250.00,
    motivo: 'defeito',
    descricao_problema: 'Produto com defeito de fabricação',
    status: 'aberto',
    data_abertura: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useTrocasDevolucoes() {
  const [registros, setRegistros] = useState<TrocaDevolucao[]>(mockRegistros);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRegistros = useCallback(async () => {
    // Mock fetch - in production this would query a real table
    setLoading(true);
    setError(null);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  }, []);

  const criarRegistro = async (input: TrocaDevolucaoInput): Promise<TrocaDevolucao | null> => {
    const valorTotal = input.valor_unitario 
      ? input.valor_unitario * input.quantidade 
      : undefined;

    const novoRegistro: TrocaDevolucao = {
      id: crypto.randomUUID(),
      ...input,
      valor_total: valorTotal,
      status: 'aberto',
      data_abertura: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRegistros(prev => [novoRegistro, ...prev]);

    toast({
      title: `${input.tipo === 'troca' ? 'Troca' : 'Devolução'} registrada`,
      description: `Pedido #${input.pedido} - ${input.produto}`,
    });

    return novoRegistro;
  };

  const atualizarStatus = async (id: string, status: StatusRegistro, resolucao?: string): Promise<boolean> => {
    setRegistros(prev => prev.map(r => {
      if (r.id !== id) return r;
      
      const updates: Partial<TrocaDevolucao> = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (status === 'em_analise') {
        updates.data_analise = new Date().toISOString();
      }

      if (['aprovado', 'recusado', 'finalizado'].includes(status)) {
        updates.data_resolucao = new Date().toISOString();
        if (resolucao) updates.resolucao = resolucao;
      }

      return { ...r, ...updates };
    }));

    toast({
      title: 'Status atualizado',
      description: `Registro movido para: ${status}`,
    });

    return true;
  };

  const gerarCredito = async (id: string, valor: number): Promise<boolean> => {
    setRegistros(prev => prev.map(r => {
      if (r.id !== id) return r;
      return {
        ...r,
        credito_gerado: true,
        valor_credito: valor,
        updated_at: new Date().toISOString(),
      };
    }));

    toast({
      title: 'Crédito gerado',
      description: `R$ ${valor.toFixed(2)} creditado`,
    });

    return true;
  };

  const getEstatisticas = useCallback(() => {
    const total = registros.length;
    const trocas = registros.filter(r => r.tipo === 'troca').length;
    const devolucoes = registros.filter(r => r.tipo === 'devolucao').length;
    const abertos = registros.filter(r => r.status === 'aberto').length;
    const emAnalise = registros.filter(r => r.status === 'em_analise').length;
    const finalizados = registros.filter(r => r.status === 'finalizado').length;
    
    const valorTotal = registros.reduce((acc, r) => acc + (r.valor_total || 0), 0);
    const creditosGerados = registros
      .filter(r => r.credito_gerado)
      .reduce((acc, r) => acc + (r.valor_credito || 0), 0);

    // Por fornecedor
    const porFornecedor: Record<string, number> = {};
    registros.forEach(r => {
      if (r.fornecedor) {
        porFornecedor[r.fornecedor] = (porFornecedor[r.fornecedor] || 0) + 1;
      }
    });

    // Por motivo
    const porMotivo: Record<string, number> = {};
    registros.forEach(r => {
      porMotivo[r.motivo] = (porMotivo[r.motivo] || 0) + 1;
    });

    return {
      total,
      trocas,
      devolucoes,
      abertos,
      emAnalise,
      finalizados,
      valorTotal,
      creditosGerados,
      porFornecedor,
      porMotivo,
    };
  }, [registros]);

  return {
    registros,
    loading,
    error,
    refetch: fetchRegistros,
    criarRegistro,
    atualizarStatus,
    gerarCredito,
    getEstatisticas,
  };
}
