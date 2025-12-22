import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider, useApp } from './AppContext';

const TestComponent = () => {
  const context = useApp();
  return <div data-testid="app-state">{context ? 'loaded' : 'error'}</div>;
};

describe('AppContext', () => {
  it('should provide app context', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    expect(screen.getByTestId('app-state')).toHaveTextContent('loaded');
  });

  it('should wrap children correctly', () => {
    render(
      <AppProvider>
        <div data-testid="child">Child</div>
      </AppProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
