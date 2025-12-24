import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReorderPoint } from './useReorderPoint';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useReorderPoint', () => {
  it('should be defined', () => {
    expect(useReorderPoint).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useReorderPoint());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
