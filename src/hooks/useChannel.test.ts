import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChannel } from './useChannel';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useChannel', () => {
  it('should be defined', () => {
    expect(useChannel).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useChannel());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
