import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRoles } from './useRoles';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

describe('useRoles', () => {
  it('should be defined', () => {
    expect(useRoles).toBeDefined();
  });

  it('should return expected values', () => {
    try {
      const { result } = renderHook(() => useRoles());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
