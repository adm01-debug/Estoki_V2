import { render, screen } from '@testing-library/react';
import { withErrorHandler } from './withErrorHandler';
import { describe, it, expect, vi } from 'vitest';

const BuggyComponent = () => {
  throw new Error('Test Error');
};

describe('withErrorHandler', () => {
  it('renders FallbackComponent when error occurs', () => {
    const Fallback = ({ error }: { error: Error }) => <div>Caught: {error.message}</div>;
    const Wrapped = withErrorHandler(BuggyComponent, { FallbackComponent: Fallback });
    
    // Suppress console.error for expected test failure
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Wrapped />);
    expect(screen.getByText('Caught: Test Error')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});
