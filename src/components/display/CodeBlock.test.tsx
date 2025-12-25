import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CodeBlock from './CodeBlock';

describe('CodeBlock', () => {
  it('should render without crashing', () => {
    render(<CodeBlock />);
  });

  it('should accept className prop', () => {
    const { container } = render(<CodeBlock className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<CodeBlock ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should render children when applicable', () => {
    render(<CodeBlock>Test Content</CodeBlock>);
    // Component specific rendering
  });
});
