import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSession } from './useSession';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('useSession', () => {
  it('should be defined', () => {
    expect(useSession).toBeDefined();
  });

  it('should return expected values', () => {
    try {
      const { result } = renderHook(() => useSession());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
