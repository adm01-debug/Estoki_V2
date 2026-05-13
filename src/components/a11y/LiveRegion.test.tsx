import { render, screen } from '@testing-library/react';
import { LiveRegion } from './LiveRegion';
import { describe, it, expect } from 'vitest';

describe('LiveRegion', () => {
  it('renders with correct accessibility attributes', () => {
    render(<LiveRegion aria-live="assertive">Test Message</LiveRegion>);
    const element = screen.getByText('Test Message');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('aria-live', 'assertive');
    expect(element).toHaveAttribute('aria-atomic', 'true');
    expect(element).toHaveAttribute('role', 'status');
  });

  it('uses default attributes when not specified', () => {
    render(<LiveRegion>Polite Message</LiveRegion>);
    const element = screen.getByText('Polite Message');
    expect(element).toHaveAttribute('aria-live', 'polite');
    expect(element).toHaveAttribute('aria-atomic', 'true');
  });
});
