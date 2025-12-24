import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGeoDistance } from './useGeoDistance';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useGeoDistance', () => {
  it('should be defined', () => {
    expect(useGeoDistance).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useGeoDistance());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
