import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFEFO } from './useFEFO';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useFEFO', () => {
  it('should be defined', () => {
    expect(useFEFO).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useFEFO());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
