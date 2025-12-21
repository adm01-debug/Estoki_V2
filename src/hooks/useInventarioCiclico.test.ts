import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInventarioCiclico } from './useInventarioCiclico';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-ciclo' }, error: null })),
        })),
      })),
    })),
  },
}));

describe('useInventarioCiclico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com array vazio de ciclos', () => {
    const { result } = renderHook(() => useInventarioCiclico());
    expect(result.current.ciclos).toEqual([]);
  });

  it('deve ter função iniciarCiclo', () => {
    const { result } = renderHook(() => useInventarioCiclico());
    expect(typeof result.current.iniciarCiclo).toBe('function');
  });

  it('deve ter função registrarContagem', () => {
    const { result } = renderHook(() => useInventarioCiclico());
    expect(typeof result.current.registrarContagem).toBe('function');
  });
});
