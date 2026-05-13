import { renderHook } from '@testing-library/react';
import { useAriaLabel } from './useAriaLabel';
import { describe, it, expect } from 'vitest';

describe('useAriaLabel', () => {
  it('should return props with generated ID for labelling', () => {
    const { result } = renderHook(() => useAriaLabel('Main Title'));
    
    expect(result.current.id).toMatch(/^label-:/);
    expect(result.current.props['aria-labelledby']).toBe(result.current.id);
    expect(result.current.labelProps.id).toBe(result.current.id);
    expect(result.current.labelProps.children).toBe('Main Title');
  });
});
