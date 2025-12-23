import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

describe('useGeolocation', () => {
  it('should start without position', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.position).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
