import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Kbd from './Kbd';

describe('Kbd', () => {
  it('should render without crashing', () => {
    render(<Kbd />);
  });

  it('should accept className prop', () => {
    const { container } = render(<Kbd className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<Kbd ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should handle props correctly', () => {
    const { container } = render(<Kbd data-testid="test-Kbd" />);
    expect(container.querySelector('[data-testid="test-Kbd"]')).toBeInTheDocument();
  });
});
