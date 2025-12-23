import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfirmation } from './useConfirmation';

describe('useConfirmation', () => {
  it('should start closed', () => {
    const { result } = renderHook(() => useConfirmation());
    expect(result.current.isOpen).toBe(false);
  });
});
