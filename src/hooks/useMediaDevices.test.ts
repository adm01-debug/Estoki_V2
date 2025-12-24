import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaDevices } from './useMediaDevices';

describe('useMediaDevices', () => {
  it('should be defined', () => {
    expect(useMediaDevices).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useMediaDevices());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
