import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('should render without errors', () => {
    const { container } = render(<EmptyState />);
    expect(container).toBeInTheDocument();
  });
});
