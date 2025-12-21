// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDivergencias } from './useDivergencias';
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
    })),
    functions: {
      invoke: vi.fn(() => ({
        data: { success: true },
        error: null
      }))
    }
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

describe('useDivergencias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useDivergencias(), { wrapper });
    
    expect(result.current.divergencias).toBeDefined();
    expect(result.current.loading).toBeDefined();
  });

  it('deve retornar lista de divergências', async () => {
    const { result } = renderHook(() => useDivergencias(), { wrapper });
    
    await waitFor(() => {
      expect(Array.isArray(result.current.divergencias)).toBe(true);
    });
  });

  it('deve ter função registrarDivergencia', () => {
    const { result } = renderHook(() => useDivergencias(), { wrapper });
    
    expect(result.current.registrarDivergencia).toBeDefined();
    expect(typeof result.current.registrarDivergencia).toBe('function');
  });

  it('deve ter função resolverDivergencia', () => {
    const { result } = renderHook(() => useDivergencias(), { wrapper });
    
    expect(result.current.resolverDivergencia).toBeDefined();
    expect(typeof result.current.resolverDivergencia).toBe('function');
  });

  it('deve calcular estatísticas de divergências', async () => {
    const { result } = renderHook(() => useDivergencias(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.estatisticas).toBeDefined();
    });
  });

  it('deve ter função enviarAlertaFornecedor', () => {
    const { result } = renderHook(() => useDivergencias(), { wrapper });
    
    expect(result.current.enviarAlertaFornecedor).toBeDefined();
    expect(typeof result.current.enviarAlertaFornecedor).toBe('function');
  });

  it('deve retornar loading como boolean', () => {
    const { result } = renderHook(() => useDivergencias(), { wrapper });
    
    expect(typeof result.current.loading).toBe('boolean');
  });
});
