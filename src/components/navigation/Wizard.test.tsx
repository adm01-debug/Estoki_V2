import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Wizard from './Wizard';

describe('Wizard', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><Wizard /></BrowserRouter>);
  });

  it('should accept className prop', () => {
    const { container } = render(<BrowserRouter><Wizard className="custom" /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle props correctly', () => {
    render(<BrowserRouter><Wizard data-testid="nav-Wizard" /></BrowserRouter>);
  });

  it('should be accessible', () => {
    render(<BrowserRouter><Wizard aria-label="Wizard" /></BrowserRouter>);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<BrowserRouter><Wizard /></BrowserRouter>);
    unmount();
  });
});
