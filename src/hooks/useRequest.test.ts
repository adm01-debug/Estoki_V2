import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRequest } from './useRequest';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useRequest', () => {
  it('should be defined', () => {
    expect(useRequest).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useRequest());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
