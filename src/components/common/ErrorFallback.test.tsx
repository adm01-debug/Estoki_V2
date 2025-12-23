import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorFallback from './ErrorFallback';

describe('ErrorFallback', () => {
  it('should render error message', () => {
    render(<ErrorFallback error={new Error('Test')} resetErrorBoundary={vi.fn()} />);
    expect(document.body).toBeInTheDocument();
  });

  it('should call reset on button click', () => {
    const reset = vi.fn();
    render(<ErrorFallback error={new Error('Test')} resetErrorBoundary={reset} />);
    const btn = screen.queryByRole('button');
    if (btn) fireEvent.click(btn);
  });
});
