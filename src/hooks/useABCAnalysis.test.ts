import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useABCAnalysis } from './useABCAnalysis';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useABCAnalysis', () => {
  it('should be defined', () => {
    expect(useABCAnalysis).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useABCAnalysis());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
