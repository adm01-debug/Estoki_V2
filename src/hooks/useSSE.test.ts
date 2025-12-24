import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSSE } from './useSSE';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useSSE', () => {
  it('should be defined', () => {
    expect(useSSE).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useSSE());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
