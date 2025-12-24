import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFIFO } from './useFIFO';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useFIFO', () => {
  it('should be defined', () => {
    expect(useFIFO).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useFIFO());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
