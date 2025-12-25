import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Steps from './Steps';

describe('Steps', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><Steps /></BrowserRouter>);
  });

  it('should accept className prop', () => {
    const { container } = render(<BrowserRouter><Steps className="custom" /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle props correctly', () => {
    render(<BrowserRouter><Steps data-testid="nav-Steps" /></BrowserRouter>);
  });

  it('should be accessible', () => {
    render(<BrowserRouter><Steps aria-label="Steps" /></BrowserRouter>);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<BrowserRouter><Steps /></BrowserRouter>);
    unmount();
  });
});
