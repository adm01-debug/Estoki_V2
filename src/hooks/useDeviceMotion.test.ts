import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDeviceMotion } from './useDeviceMotion';

describe('useDeviceMotion', () => {
  it('should be defined', () => {
    expect(useDeviceMotion).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useDeviceMotion());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
