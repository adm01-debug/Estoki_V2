import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StreakSystem from './StreakSystem';
describe('StreakSystem', () => {
  it('should render', () => {
    const { container } = render(<StreakSystem />);
    expect(container).toBeInTheDocument();
  });
});
