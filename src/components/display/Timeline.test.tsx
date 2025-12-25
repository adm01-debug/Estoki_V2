import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Timeline from './Timeline';

describe('Timeline', () => {
  it('should render without crashing', () => {
    render(<Timeline />);
  });

  it('should accept className prop', () => {
    const { container } = render(<Timeline className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<Timeline ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should handle props correctly', () => {
    const { container } = render(<Timeline data-testid="test-Timeline" />);
    expect(container.querySelector('[data-testid="test-Timeline"]')).toBeInTheDocument();
  });
});
