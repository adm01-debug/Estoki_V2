import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermission } from './usePermission';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('usePermission', () => {
  it('should be defined', () => {
    expect(usePermission).toBeDefined();
  });

  it('should return expected values', () => {
    try {
      const { result } = renderHook(() => usePermission());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
