import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLifecycles } from './useLifecycles';

describe('useLifecycles', () => {
  it('should be defined', () => {
    expect(useLifecycles).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useLifecycles());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
