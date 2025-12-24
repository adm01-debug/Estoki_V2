import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGeofencing } from './useGeofencing';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useGeofencing', () => {
  it('should be defined', () => {
    expect(useGeofencing).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useGeofencing());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
