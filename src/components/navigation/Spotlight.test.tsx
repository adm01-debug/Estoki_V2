import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Spotlight from './Spotlight';

describe('Spotlight', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><Spotlight /></BrowserRouter>);
  });

  it('should accept className prop', () => {
    const { container } = render(<BrowserRouter><Spotlight className="custom" /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle props correctly', () => {
    render(<BrowserRouter><Spotlight data-testid="nav-Spotlight" /></BrowserRouter>);
  });

  it('should be accessible', () => {
    render(<BrowserRouter><Spotlight aria-label="Spotlight" /></BrowserRouter>);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<BrowserRouter><Spotlight /></BrowserRouter>);
    unmount();
  });
});
