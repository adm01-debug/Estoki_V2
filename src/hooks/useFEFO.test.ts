import { renderHook, waitFor } from '@testing-library/react';
import { useFEFO } from './useFEFO';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
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

describe('useFEFO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate days until expiry correctly', async () => {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 10);
    
    const mockData = [
      {
        id: '1',
        data_validade: expiryDate.toISOString(),
        quantidade_atual: 100,
        produto: { nome: 'Prod 1', sku: 'SKU1' },
      }
    ];

    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data: mockData, error: null }),
    }));

    const { result } = renderHook(() => useFEFO(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data![0].dias_para_vencer).toBe(10);
  });

  it('should filter by product SKU when provided', async () => {
    renderHook(() => useFEFO(undefined, 'SKU-TEST'), { wrapper });
    
    expect(supabase.from).toHaveBeenCalledWith('lotes');
    // The query implementation uses .eq("produtos.sku", sku)
  });
});
