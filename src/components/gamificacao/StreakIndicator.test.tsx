import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StreakIndicator from './StreakIndicator';
describe('StreakIndicator', () => {
  it('should render', () => {
    const { container } = render(<StreakIndicator streak={5} />);
    expect(container).toBeInTheDocument();
  });
});
