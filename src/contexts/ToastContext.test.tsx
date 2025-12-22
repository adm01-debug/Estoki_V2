import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToastContext } from './ToastContext';

const TestComponent = () => {
  const context = useToastContext();
  return <div data-testid="toast">{context ? 'ready' : 'error'}</div>;
};

describe('ToastContext', () => {
  it('should provide toast context', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>);
    expect(screen.getByTestId('toast')).toHaveTextContent('ready');
  });
});
