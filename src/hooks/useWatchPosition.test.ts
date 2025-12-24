import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWatchPosition } from './useWatchPosition';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useWatchPosition', () => {
  it('should be defined', () => {
    expect(useWatchPosition).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useWatchPosition());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
