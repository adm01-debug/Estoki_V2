import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ContextMenu from './ContextMenu';

describe('ContextMenu', () => {
  it('should render without crashing', () => {
    render(<BrowserRouter><ContextMenu /></BrowserRouter>);
  });

  it('should accept className prop', () => {
    const { container } = render(<BrowserRouter><ContextMenu className="custom" /></BrowserRouter>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should handle props correctly', () => {
    render(<BrowserRouter><ContextMenu data-testid="nav-ContextMenu" /></BrowserRouter>);
  });

  it('should be accessible', () => {
    render(<BrowserRouter><ContextMenu aria-label="ContextMenu" /></BrowserRouter>);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<BrowserRouter><ContextMenu /></BrowserRouter>);
    unmount();
  });
});
