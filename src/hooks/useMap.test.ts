import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMap } from './useMap';

describe('useMap', () => {
  it('should initialize with default map', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1]]));
    expect(result.current.map.get('a')).toBe(1);
  });

  it('should set value', () => {
    const { result } = renderHook(() => useMap<string, number>());
    act(() => { result.current.set('key', 42); });
    expect(result.current.map.get('key')).toBe(42);
  });

  it('should delete value', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1]]));
    act(() => { result.current.remove('a'); });
    expect(result.current.map.has('a')).toBe(false);
  });

  it('should clear map', () => {
    const { result } = renderHook(() => useMap<string, number>([['a', 1], ['b', 2]]));
    act(() => { result.current.clear(); });
    expect(result.current.map.size).toBe(0);
  });
});
