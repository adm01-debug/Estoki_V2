import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Rating } from './Rating';

describe('Rating', () => {
  it('renders correct number of stars', () => {
    const { container } = render(<Rating value={3} max={5} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('calls onChange when a star is clicked', () => {
    const onChange = vi.fn();
    const { container } = render(<Rating value={0} onChange={onChange} />);
    const stars = container.querySelectorAll('svg');
    fireEvent.click(stars[2]); // 3rd star
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
