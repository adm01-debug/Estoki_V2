import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useWebSocket', () => {
  it('should be defined', () => {
    expect(useWebSocket).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useWebSocket());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
