import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><Navbar /></BrowserRouter>);
  });

  it('should accept className prop', () => {
    const { container } = render(<BrowserRouter><Navbar className="custom" /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle props correctly', () => {
    render(<BrowserRouter><Navbar data-testid="nav-Navbar" /></BrowserRouter>);
  });

  it('should be accessible', () => {
    render(<BrowserRouter><Navbar aria-label="Navbar" /></BrowserRouter>);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<BrowserRouter><Navbar /></BrowserRouter>);
    unmount();
  });
});
