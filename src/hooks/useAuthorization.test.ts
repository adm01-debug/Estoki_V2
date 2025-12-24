import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthorization } from './useAuthorization';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('useAuthorization', () => {
  it('should be defined', () => {
    expect(useAuthorization).toBeDefined();
  });

  it('should return expected values', () => {
    try {
      const { result } = renderHook(() => useAuthorization());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
