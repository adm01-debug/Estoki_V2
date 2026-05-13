import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInventarioCiclico } from './useInventarioCiclico';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'test-ciclo' }, error: null }),
        })),
      })),
      then: vi.fn((cb) => Promise.resolve(cb({ data: [], error: null }))),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

describe('useInventarioCiclico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar corretamente', async () => {
    const { result } = renderHook(() => useInventarioCiclico());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.ciclos).toEqual([]);
  });

  it('deve ter funções de ação definidas', () => {
    const { result } = renderHook(() => useInventarioCiclico());
    expect(typeof result.current.iniciarCiclo).toBe('function');
    expect(typeof result.current.registrarContagem).toBe('function');
  });
});
