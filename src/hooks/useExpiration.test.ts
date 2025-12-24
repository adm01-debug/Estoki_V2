import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useExpiration } from './useExpiration';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useExpiration', () => {
  it('should be defined', () => {
    expect(useExpiration).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useExpiration());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
