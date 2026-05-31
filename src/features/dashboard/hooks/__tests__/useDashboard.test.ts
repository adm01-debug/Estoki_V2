import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from '../useDashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mocking Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          count: vi.fn(() => ({ data: 10, error: null })),
        })),
        is: vi.fn(() => ({
          count: vi.fn(() => ({ data: 5, error: null })),
        })),
        limit: vi.fn(() => ({ data: [], error: null })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({ data: [], error: null })),
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
          limit: vi.fn(() => ({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useDashboard hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return dashboard metrics', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.kpis).toBeDefined();
    expect(result.current.ocupacaoPP).toBeInstanceOf(Array);
    expect(result.current.movimentacoes7dias).toBeInstanceOf(Array);
  });
});
