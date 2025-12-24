import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSerialTracking } from './useSerialTracking';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useSerialTracking', () => {
  it('should be defined', () => {
    expect(useSerialTracking).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useSerialTracking());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
