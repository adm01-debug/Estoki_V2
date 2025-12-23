import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProgressRing from './ProgressRing';

describe('ProgressRing', () => {
  it('should render without errors', () => {
    const { container } = render(<ProgressRing />);
    expect(container).toBeInTheDocument();
  });
});
