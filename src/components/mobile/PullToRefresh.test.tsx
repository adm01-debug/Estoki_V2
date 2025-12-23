import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PullToRefresh from './PullToRefresh';

describe('PullToRefresh', () => {
  it('should render without errors', () => {
    const { container } = render(<PullToRefresh />);
    expect(container).toBeInTheDocument();
  });
});
