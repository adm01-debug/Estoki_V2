import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIdle } from './useIdle';

describe('useIdle', () => {
  it('should start not idle', () => {
    const { result } = renderHook(() => useIdle());
    expect(result.current).toBe(false);
  });
});
