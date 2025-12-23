import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SkeletonLoader from './SkeletonLoader';

describe('SkeletonLoader', () => {
  it('should render without errors', () => {
    const { container } = render(<SkeletonLoader />);
    expect(container).toBeInTheDocument();
  });
});
