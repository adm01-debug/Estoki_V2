import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Timeline from './Timeline';

describe('Timeline', () => {
  it('should render timeline', () => {
    const { container } = render(<Timeline items={[]} />);
    expect(container).toBeInTheDocument();
  });
});
