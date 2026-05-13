import { render, screen } from '@testing-library/react';
import { withLoading } from './withLoading';
import { describe, it, expect } from 'vitest';

const TestComponent = () => <div>Loaded</div>;

describe('withLoading', () => {
  it('renders WrappedComponent', () => {
    const Wrapped = withLoading(TestComponent);
    render(<Wrapped />);
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
