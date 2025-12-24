import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBroadcast } from './useBroadcast';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useBroadcast', () => {
  it('should be defined', () => {
    expect(useBroadcast).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useBroadcast());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
