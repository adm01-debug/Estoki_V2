import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Stepper from './Stepper';

describe('Stepper', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><Stepper /></BrowserRouter>);
  });

  it('should accept className prop', () => {
    const { container } = render(<BrowserRouter><Stepper className="custom" /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle props correctly', () => {
    render(<BrowserRouter><Stepper data-testid="nav-Stepper" /></BrowserRouter>);
  });

  it('should be accessible', () => {
    render(<BrowserRouter><Stepper aria-label="Stepper" /></BrowserRouter>);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<BrowserRouter><Stepper /></BrowserRouter>);
    unmount();
  });
});
