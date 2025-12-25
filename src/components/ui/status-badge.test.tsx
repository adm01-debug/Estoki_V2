import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('should render status text', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should apply correct color for success status', () => {
    const { container } = render(<StatusBadge status="success" />);
    expect(container.firstChild).toHaveClass('bg-green');
  });

  it('should apply correct color for error status', () => {
    const { container } = render(<StatusBadge status="error" />);
    expect(container.firstChild).toHaveClass('bg-red');
  });

  it('should apply correct color for warning status', () => {
    const { container } = render(<StatusBadge status="warning" />);
    expect(container.firstChild).toHaveClass('bg-yellow');
  });

  it('should accept custom className', () => {
    const { container } = render(<StatusBadge status="info" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});
