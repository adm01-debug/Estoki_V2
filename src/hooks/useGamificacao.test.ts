import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGamificacao } from './useGamificacao';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { pontos: 100, nivel: 1 }, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

describe('useGamificacao', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com pontos e nível', () => {
    const { result } = renderHook(() => useGamificacao());
    expect(result.current.pontos).toBeDefined();
    expect(result.current.nivel).toBeDefined();
  });

  it('deve ter função adicionarPontos', () => {
    const { result } = renderHook(() => useGamificacao());
    expect(typeof result.current.adicionarPontos).toBe('function');
  });

  it('deve ter conquistas como array', () => {
    const { result } = renderHook(() => useGamificacao());
    expect(Array.isArray(result.current.conquistas)).toBe(true);
  });
});
