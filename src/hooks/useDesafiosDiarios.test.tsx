import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDesafiosDiarios } from './useDesafiosDiarios';
import { ReactNode } from 'react';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              data: [],
              error: null
            }))
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
            data: { id: 'test-id' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock do AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
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

describe('useDesafiosDiarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useDesafiosDiarios(), { wrapper });
    
    expect(result.current.desafios).toBeDefined();
    expect(result.current.loading).toBeDefined();
  });

  it('deve retornar lista de desafios do dia', async () => {
    const { result } = renderHook(() => useDesafiosDiarios(), { wrapper });
    
    await waitFor(() => {
      expect(Array.isArray(result.current.desafios)).toBe(true);
    });
  });

  it('deve ter função completarDesafio', () => {
    const { result } = renderHook(() => useDesafiosDiarios(), { wrapper });
    
    expect(result.current.completarDesafio).toBeDefined();
    expect(typeof result.current.completarDesafio).toBe('function');
  });

  it('deve retornar progresso do dia', async () => {
    const { result } = renderHook(() => useDesafiosDiarios(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.progressoDia).toBeDefined();
    });
  });

  it('deve ter estatísticas de desafios', async () => {
    const { result } = renderHook(() => useDesafiosDiarios(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.estatisticas).toBeDefined();
    });
  });

  it('deve identificar se é novo dia', () => {
    const { result } = renderHook(() => useDesafiosDiarios(), { wrapper });
    
    expect(typeof result.current.isNovoDia).toBe('boolean');
  });
});
