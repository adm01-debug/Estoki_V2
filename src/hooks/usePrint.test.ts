import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrint } from './usePrint';

describe('usePrint', () => {
  it('should have print function', () => {
    const { result } = renderHook(() => usePrint());
    expect(result.current.print).toBeDefined();
    expect(result.current.printRef).toBeDefined();
  });
});
