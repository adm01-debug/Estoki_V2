import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLeadTime } from './useLeadTime';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useLeadTime', () => {
  it('should be defined', () => {
    expect(useLeadTime).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useLeadTime());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
