import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNetworkState } from './useNetworkState';

describe('useNetworkState', () => {
  it('should return network state', () => {
    const { result } = renderHook(() => useNetworkState());
    expect(typeof result.current.online).toBe('boolean');
  });
});
