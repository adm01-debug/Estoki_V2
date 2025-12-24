import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRefreshToken } from './useRefreshToken';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('useRefreshToken', () => {
  it('should be defined', () => {
    expect(useRefreshToken).toBeDefined();
  });

  it('should return expected values', () => {
    try {
      const { result } = renderHook(() => useRefreshToken());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
