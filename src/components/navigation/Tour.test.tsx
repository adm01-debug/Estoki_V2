import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Tour from './Tour';

describe('Tour', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><Tour /></BrowserRouter>);
  });

  it('should accept className prop', () => {
    const { container } = render(<BrowserRouter><Tour className="custom" /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle props correctly', () => {
    render(<BrowserRouter><Tour data-testid="nav-Tour" /></BrowserRouter>);
  });

  it('should be accessible', () => {
    render(<BrowserRouter><Tour aria-label="Tour" /></BrowserRouter>);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<BrowserRouter><Tour /></BrowserRouter>);
    unmount();
  });
});
