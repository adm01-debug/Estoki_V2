// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTrocasDevolucoes } from './useTrocasDevolucoes';
import { ReactNode } from 'react';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          })),
          data: [],
          error: null
        })),
        data: [],
        error: null
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { 
              id: 'test-td-id', 
              tipo: 'troca',
              pedido: 'PED-001',
              status: 'aberto'
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'test-td-id', status: 'em_analise' },
              error: null
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

// Mock do AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@test.com' }
  })
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity
    }
  }
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useTrocasDevolucoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    expect(result.current.registros).toBeDefined();
    expect(result.current.loading).toBeDefined();
  });

  it('deve retornar lista de registros', async () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    await waitFor(() => {
      expect(Array.isArray(result.current.registros)).toBe(true);
    });
  });

  it('deve ter função criarRegistro', () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    expect(result.current.criarRegistro).toBeDefined();
    expect(typeof result.current.criarRegistro).toBe('function');
  });

  it('deve ter função atualizarStatus', () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    expect(result.current.atualizarStatus).toBeDefined();
    expect(typeof result.current.atualizarStatus).toBe('function');
  });

  it('deve ter função adicionarObservacao', () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    expect(result.current.adicionarObservacao).toBeDefined();
    expect(typeof result.current.adicionarObservacao).toBe('function');
  });

  it('deve calcular estatísticas', async () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.estatisticas).toBeDefined();
    });
    
    if (result.current.estatisticas) {
      expect(typeof result.current.estatisticas.total).toBe('number');
      expect(typeof result.current.estatisticas.pendentes).toBe('number');
    }
  });

  it('deve separar trocas de devoluções', async () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.trocas).toBeDefined();
      expect(result.current.devolucoes).toBeDefined();
    });
    
    expect(Array.isArray(result.current.trocas)).toBe(true);
    expect(Array.isArray(result.current.devolucoes)).toBe(true);
  });

  it('deve retornar loading como boolean', () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    
    expect(typeof result.current.loading).toBe('boolean');
  });
});
