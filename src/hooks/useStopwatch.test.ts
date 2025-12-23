import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStopwatch } from './useStopwatch';

describe('useStopwatch', () => {
  it('should start at 0', () => {
    const { result } = renderHook(() => useStopwatch());
    expect(result.current.time).toBe(0);
  });
});
