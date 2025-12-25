import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import withLoading from './withLoading';

const TestComponent = ({ data }: { data: string }) => <div>{data}</div>;

describe('withLoading HOC', () => {
  it('should render loading state when isLoading is true', () => {
    const WrappedComponent = withLoading(TestComponent);
    render(<WrappedComponent isLoading={true} data="test" />);
    expect(screen.queryByText('test')).not.toBeInTheDocument();
  });

  it('should render component when isLoading is false', () => {
    const WrappedComponent = withLoading(TestComponent);
    render(<WrappedComponent isLoading={false} data="test data" />);
    expect(screen.getByText('test data')).toBeInTheDocument();
  });

  it('should render custom loading component', () => {
    const CustomLoader = () => <div>Custom Loading...</div>;
    const WrappedComponent = withLoading(TestComponent, CustomLoader);
    render(<WrappedComponent isLoading={true} data="test" />);
    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
  });

  it('should pass all props except isLoading to wrapped component', () => {
    const PropsComponent = ({ a, b }: { a: string; b: number }) => <div>{a}-{b}</div>;
    const WrappedComponent = withLoading(PropsComponent);
    render(<WrappedComponent isLoading={false} a="hello" b={42} />);
    expect(screen.getByText('hello-42')).toBeInTheDocument();
  });

  it('should set correct display name', () => {
    const NamedComponent = () => <div>Named</div>;
    NamedComponent.displayName = 'MyComponent';
    const WrappedComponent = withLoading(NamedComponent);
    expect(WrappedComponent.displayName).toBe('withLoading(MyComponent)');
  });
});
