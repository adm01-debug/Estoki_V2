import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingFallback } from './LoadingFallback';

describe('LoadingFallback', () => {
  it('should render loading indicator', () => {
    const { container } = render(<LoadingFallback />);
    expect(container).toBeInTheDocument();
  });
});
