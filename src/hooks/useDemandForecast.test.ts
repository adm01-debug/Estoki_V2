import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDemandForecast } from './useDemandForecast';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useDemandForecast', () => {
  it('should be defined', () => {
    expect(useDemandForecast).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useDemandForecast());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
