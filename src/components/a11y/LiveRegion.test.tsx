import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LiveRegion from './LiveRegion';

describe('LiveRegion', () => {
  it('should render with aria-live attribute', () => {
    render(<LiveRegion>Live content</LiveRegion>);
    const element = screen.getByText('Live content');
    expect(element).toHaveAttribute('aria-live');
  });

  it('should support polite mode', () => {
    render(<LiveRegion mode="polite">Polite message</LiveRegion>);
    const element = screen.getByText('Polite message');
    expect(element).toHaveAttribute('aria-live', 'polite');
  });

  it('should support assertive mode', () => {
    render(<LiveRegion mode="assertive">Assertive message</LiveRegion>);
    const element = screen.getByText('Assertive message');
    expect(element).toHaveAttribute('aria-live', 'assertive');
  });

  it('should support off mode', () => {
    render(<LiveRegion mode="off">Off message</LiveRegion>);
    const element = screen.getByText('Off message');
    expect(element).toHaveAttribute('aria-live', 'off');
  });

  it('should render role status by default', () => {
    render(<LiveRegion>Status message</LiveRegion>);
    const element = screen.getByRole('status');
    expect(element).toBeInTheDocument();
  });
});
