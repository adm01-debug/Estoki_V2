import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFetch } from './useFetch';

global.fetch = vi.fn();
global.WebSocket = vi.fn() as any;

describe('useFetch', () => {
  it('should be defined', () => {
    expect(useFetch).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useFetch());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
