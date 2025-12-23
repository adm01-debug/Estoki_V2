import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMounted } from './useMounted';

describe('useMounted', () => {
  it('should return true when mounted', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current()).toBe(true);
  });
});
