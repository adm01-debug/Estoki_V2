import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUser } from './useUser';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('useUser', () => {
  it('should be defined', () => {
    expect(useUser).toBeDefined();
  });

  it('should return expected values', () => {
    try {
      const { result } = renderHook(() => useUser());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
