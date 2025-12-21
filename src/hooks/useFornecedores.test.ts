import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFornecedores } from './useFornecedores';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

describe('useFornecedores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com array vazio de fornecedores', () => {
    const { result } = renderHook(() => useFornecedores());
    expect(result.current.fornecedores).toEqual([]);
  });

  it('deve inicializar com loading true', () => {
    const { result } = renderHook(() => useFornecedores());
    expect(result.current.loading).toBe(true);
  });

  it('deve ter função refetch', () => {
    const { result } = renderHook(() => useFornecedores());
    expect(typeof result.current.refetch).toBe('function');
  });

  it('deve ter métricas por fornecedor', () => {
    const { result } = renderHook(() => useFornecedores());
    expect(result.current.metricasFornecedor).toBeDefined();
  });
});
