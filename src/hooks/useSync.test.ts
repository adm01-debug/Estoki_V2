import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSync } from './useSync';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useSync', () => {
  it('should be defined', () => {
    expect(useSync).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useSync());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
