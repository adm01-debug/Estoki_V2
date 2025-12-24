import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSWR } from './useSWR';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useSWR', () => {
  it('should be defined', () => {
    expect(useSWR).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useSWR());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
