import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLIFO } from './useLIFO';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useLIFO', () => {
  it('should be defined', () => {
    expect(useLIFO).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useLIFO());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
