import { render, screen } from '@testing-library/react';
import { Announce } from './Announce';
import { describe, it, expect } from 'vitest';

describe('Announce', () => {
  it('renders the message with correct accessibility attributes', () => {
    render(<Announce message="Test message" politeness="assertive" />);
    const element = screen.getByText('Test message');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('role', 'status');
    expect(element).toHaveAttribute('aria-live', 'assertive');
    expect(element).toHaveAttribute('aria-atomic', 'true');
    expect(element).toHaveClass('sr-only');
  });

  it('uses default politeness when not provided', () => {
    render(<Announce message="Default message" />);
    const element = screen.getByText('Default message');
    expect(element).toHaveAttribute('aria-live', 'polite');
  });
});
