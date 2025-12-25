import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Highlight from './Highlight';

describe('Highlight', () => {
  it('should render without crashing', () => {
    render(<Highlight />);
  });

  it('should accept className prop', () => {
    const { container } = render(<Highlight className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<Highlight ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should handle props correctly', () => {
    const { container } = render(<Highlight data-testid="test-Highlight" />);
    expect(container.querySelector('[data-testid="test-Highlight"]')).toBeInTheDocument();
  });
});
