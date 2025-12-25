import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import withErrorHandler from './withErrorHandler';

const TestComponent = () => <div>Test Content</div>;
const ErrorComponent = () => { throw new Error('Test Error'); };

describe('withErrorHandler HOC', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  beforeEach(() => { consoleSpy.mockClear(); });

  it('should render component normally when no error', () => {
    const WrappedComponent = withErrorHandler(TestComponent);
    render(<WrappedComponent />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should catch errors and render fallback', () => {
    const WrappedComponent = withErrorHandler(ErrorComponent);
    render(<WrappedComponent />);
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('should render custom error fallback', () => {
    const CustomFallback = ({ error }: { error: Error }) => <div>Error: {error.message}</div>;
    const WrappedComponent = withErrorHandler(ErrorComponent, CustomFallback);
    render(<WrappedComponent />);
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    const PropsComponent = ({ message }: { message: string }) => <div>{message}</div>;
    const WrappedComponent = withErrorHandler(PropsComponent);
    render(<WrappedComponent message="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should set correct display name', () => {
    const NamedComponent = () => <div>Named</div>;
    NamedComponent.displayName = 'TestComp';
    const WrappedComponent = withErrorHandler(NamedComponent);
    expect(WrappedComponent.displayName).toBe('withErrorHandler(TestComp)');
  });
});
