import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render without errors', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container).toBeInTheDocument();
  });
});
