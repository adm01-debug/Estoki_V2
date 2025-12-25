import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Counter from './Counter';

describe('Counter', () => {
  it('should render without crashing', () => {
    render(<Counter />);
  });

  it('should accept className prop', () => {
    const { container } = render(<Counter className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<Counter ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should render children when applicable', () => {
    render(<Counter>Test Content</Counter>);
    // Component specific rendering
  });
});
