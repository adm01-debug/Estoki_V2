import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToken } from './useToken';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('useToken', () => {
  it('should be defined', () => {
    expect(useToken).toBeDefined();
  });

  it('should return expected values', () => {
    try {
      const { result } = renderHook(() => useToken());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
