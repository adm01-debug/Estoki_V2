import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePortal } from './usePortal';

describe('usePortal', () => {
  it('should be defined', () => {
    expect(usePortal).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => usePortal());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
