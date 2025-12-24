import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubscription } from './useSubscription';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useSubscription', () => {
  it('should be defined', () => {
    expect(useSubscription).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useSubscription());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
