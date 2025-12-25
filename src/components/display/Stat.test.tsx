import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Stat from './Stat';

describe('Stat', () => {
  it('should render without crashing', () => {
    render(<Stat />);
  });

  it('should accept className prop', () => {
    const { container } = render(<Stat className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<Stat ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should handle props correctly', () => {
    const { container } = render(<Stat data-testid="test-Stat" />);
    expect(container.querySelector('[data-testid="test-Stat"]')).toBeInTheDocument();
  });
});
