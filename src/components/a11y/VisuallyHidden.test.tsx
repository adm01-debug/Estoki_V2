import { render, screen } from '@testing-library/react';
import { VisuallyHidden } from './VisuallyHidden';
import { describe, it, expect } from 'vitest';

describe('VisuallyHidden', () => {
  it('renders children with visually hidden styles', () => {
    const { container } = render(<VisuallyHidden>Hidden Content</VisuallyHidden>);
    const element = screen.getByText('Hidden Content');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      clip: 'rect(0, 0, 0, 0)'
    });
  });

  it('renders as different element if specified', () => {
    const { container } = render(<VisuallyHidden as="div">Hidden Div</VisuallyHidden>);
    const element = screen.getByText('Hidden Div');
    expect(element.tagName).toBe('DIV');
  });
});
