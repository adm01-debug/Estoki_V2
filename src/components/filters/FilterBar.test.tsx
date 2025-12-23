import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FilterBar from './FilterBar';

describe('FilterBar', () => {
  it('should render without errors', () => {
    const { container } = render(<FilterBar />);
    expect(container).toBeInTheDocument();
  });
});
