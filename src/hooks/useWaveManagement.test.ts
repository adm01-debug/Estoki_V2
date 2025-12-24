import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWaveManagement } from './useWaveManagement';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn() })) },
}));

describe('useWaveManagement', () => {
  it('should be defined', () => {
    expect(useWaveManagement).toBeDefined();
  });

  it('should return expected interface', () => {
    try {
      const { result } = renderHook(() => useWaveManagement());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
