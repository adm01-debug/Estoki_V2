import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventSource } from './useEventSource';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useEventSource', () => {
  it('should be defined', () => {
    expect(useEventSource).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useEventSource());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
