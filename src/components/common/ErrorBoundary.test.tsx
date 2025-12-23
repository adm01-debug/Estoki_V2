import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = () => { throw new Error('Test error'); };

describe('ErrorBoundary', () => {
  beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('should render children when no error', () => {
    render(<ErrorBoundary><div>Content</div></ErrorBoundary>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render fallback on error', () => {
    render(<ErrorBoundary><ThrowError /></ErrorBoundary>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
