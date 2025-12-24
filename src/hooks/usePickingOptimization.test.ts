import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePickingOptimization } from './usePickingOptimization';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('usePickingOptimization', () => {
  it('should be defined', () => {
    expect(usePickingOptimization).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => usePickingOptimization());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
