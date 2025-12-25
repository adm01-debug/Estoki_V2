import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VisuallyHidden from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('should render children', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText('Hidden text')).toBeInTheDocument();
  });

  it('should have sr-only class', () => {
    render(<VisuallyHidden>Screen reader only</VisuallyHidden>);
    const element = screen.getByText('Screen reader only');
    expect(element).toHaveClass('sr-only');
  });

  it('should render as span by default', () => {
    render(<VisuallyHidden>Default span</VisuallyHidden>);
    const element = screen.getByText('Default span');
    expect(element.tagName).toBe('SPAN');
  });

  it('should render as custom element', () => {
    render(<VisuallyHidden as="div">Custom div</VisuallyHidden>);
    const element = screen.getByText('Custom div');
    expect(element.tagName).toBe('DIV');
  });

  it('should pass additional props', () => {
    render(<VisuallyHidden id="hidden-text">With ID</VisuallyHidden>);
    const element = screen.getByText('With ID');
    expect(element).toHaveAttribute('id', 'hidden-text');
  });
});
