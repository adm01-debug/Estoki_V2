import { renderHook } from '@testing-library/react';
import { useMovimentacoes } from './useMovimentacoes';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useMovimentacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', async () => {
    const { result } = renderHook(() => useMovimentacoes());
    expect(result.current.loading).toBe(true);
  });

  it('should call supabase to fetch data on mount', async () => {
    renderHook(() => useMovimentacoes());
    expect(supabase.from).toHaveBeenCalledWith('rastreamento_historico');
  });

  it('should register a new movement successfully', async () => {
    const { result } = renderHook(() => useMovimentacoes());
    
    const success = await result.current.registrarMovimentacao({
      tipo: 'recebimento_nf',
      produto_id: 'prod-1',
      quantidade: 10,
      descricao: 'Teste',
    });

    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('rastreamento_historico');
  });
});
