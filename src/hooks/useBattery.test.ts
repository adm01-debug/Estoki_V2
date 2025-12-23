import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBattery } from './useBattery';

describe('useBattery', () => {
  it('should start without battery info', () => {
    const { result } = renderHook(() => useBattery());
    expect(result.current).toBeNull();
  });
});
