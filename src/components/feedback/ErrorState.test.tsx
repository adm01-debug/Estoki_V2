import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('should render without errors', () => {
    const { container } = render(<ErrorState />);
    expect(container).toBeInTheDocument();
  });
});
