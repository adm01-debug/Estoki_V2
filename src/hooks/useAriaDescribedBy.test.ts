import { renderHook } from '@testing-library/react';
import { useAriaDescribedBy } from './useAriaDescribedBy';
import { describe, it, expect } from 'vitest';

describe('useAriaDescribedBy', () => {
  it('should return props with generated ID', () => {
    const { result } = renderHook(() => useAriaDescribedBy('Helpful description'));
    
    expect(result.current.id).toMatch(/^desc-:/);
    expect(result.current.props['aria-describedby']).toBe(result.current.id);
    expect(result.current.descriptionProps.id).toBe(result.current.id);
    expect(result.current.descriptionProps.children).toBe('Helpful description');
  });

  it('should update description when input changes', () => {
    let description = 'Old description';
    const { result, rerender } = renderHook(({ desc }) => useAriaDescribedBy(desc), {
      initialProps: { desc: description }
    });

    expect(result.current.descriptionProps.children).toBe('Old description');

    rerender({ desc: 'New description' });
    expect(result.current.descriptionProps.children).toBe('New description');
  });
});
