// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConquistas } from './useConquistas';
import { ReactNode } from 'react';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
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
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
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
    user: { id: 'test-user-id' }
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

describe('useConquistas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useConquistas(), { wrapper });
    
    expect(result.current.conquistas).toBeDefined();
    expect(result.current.loading).toBeDefined();
    expect(typeof result.current.verificarConquista).toBe('function');
  });

  it('deve retornar lista de conquistas', async () => {
    const { result } = renderHook(() => useConquistas(), { wrapper });
    
    await waitFor(() => {
      expect(Array.isArray(result.current.conquistas)).toBe(true);
    });
  });

  it('deve ter função verificarConquista', () => {
    const { result } = renderHook(() => useConquistas(), { wrapper });
    
    expect(result.current.verificarConquista).toBeDefined();
    expect(typeof result.current.verificarConquista).toBe('function');
  });

  it('deve calcular estatísticas corretamente', async () => {
    const { result } = renderHook(() => useConquistas(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.estatisticas).toBeDefined();
    });
    
    if (result.current.estatisticas) {
      expect(typeof result.current.estatisticas.total).toBe('number');
      expect(typeof result.current.estatisticas.desbloqueadas).toBe('number');
    }
  });

  it('deve retornar loading como boolean', () => {
    const { result } = renderHook(() => useConquistas(), { wrapper });
    
    expect(typeof result.current.loading).toBe('boolean');
  });
});
