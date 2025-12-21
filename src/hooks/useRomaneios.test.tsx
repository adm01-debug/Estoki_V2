import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRomaneios } from './useRomaneios';
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
            data: { id: 'test-romaneio-id', numero: 'ROM-001' },
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

describe('useRomaneios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    expect(result.current.romaneios).toBeDefined();
    expect(result.current.loading).toBeDefined();
  });

  it('deve retornar lista de romaneios', async () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    await waitFor(() => {
      expect(Array.isArray(result.current.romaneios)).toBe(true);
    });
  });

  it('deve ter função criarRomaneio', () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    expect(result.current.criarRomaneio).toBeDefined();
    expect(typeof result.current.criarRomaneio).toBe('function');
  });

  it('deve ter função adicionarItem', () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    expect(result.current.adicionarItem).toBeDefined();
    expect(typeof result.current.adicionarItem).toBe('function');
  });

  it('deve ter função finalizarRomaneio', () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    expect(result.current.finalizarRomaneio).toBeDefined();
    expect(typeof result.current.finalizarRomaneio).toBe('function');
  });

  it('deve ter função cancelarRomaneio', () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    expect(result.current.cancelarRomaneio).toBeDefined();
    expect(typeof result.current.cancelarRomaneio).toBe('function');
  });

  it('deve retornar estatísticas', async () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.estatisticas).toBeDefined();
    });
  });

  it('deve retornar loading como boolean', () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    
    expect(typeof result.current.loading).toBe('boolean');
  });
});
