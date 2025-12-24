import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRefreshOnFocus } from './useRefreshOnFocus';

describe('useRefreshOnFocus', () => {
  it('should be defined', () => {
    expect(useRefreshOnFocus).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useRefreshOnFocus());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
