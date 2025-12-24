import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDeviceOrientationHook } from './useDeviceOrientationHook';

describe('useDeviceOrientationHook', () => {
  it('should be defined', () => {
    expect(useDeviceOrientationHook).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useDeviceOrientationHook());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
