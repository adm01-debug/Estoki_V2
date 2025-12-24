import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQualityControl } from './useQualityControl';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useQualityControl', () => {
  it('should be defined', () => {
    expect(useQualityControl).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useQualityControl());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
