import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Announce from './Announce';

describe('Announce', () => {
  it('should render with aria-live polite by default', () => {
    render(<Announce>Test announcement</Announce>);
    const element = screen.getByText('Test announcement');
    expect(element).toHaveAttribute('aria-live', 'polite');
  });

  it('should render with aria-live assertive when urgent', () => {
    render(<Announce priority="assertive">Urgent message</Announce>);
    const element = screen.getByText('Urgent message');
    expect(element).toHaveAttribute('aria-live', 'assertive');
  });

  it('should be visually hidden by default', () => {
    render(<Announce>Hidden message</Announce>);
    const element = screen.getByText('Hidden message');
    expect(element).toHaveClass('sr-only');
  });

  it('should render children correctly', () => {
    render(<Announce><span>Child element</span></Announce>);
    expect(screen.getByText('Child element')).toBeInTheDocument();
  });

  it('should have aria-atomic attribute', () => {
    render(<Announce atomic>Atomic announcement</Announce>);
    const element = screen.getByText('Atomic announcement');
    expect(element).toHaveAttribute('aria-atomic', 'true');
  });
});
