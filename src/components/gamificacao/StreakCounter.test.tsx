import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakCounter } from './StreakCounter';

describe('StreakCounter', () => {
  it('should render streak count', () => {
    render(<StreakCounter streak={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
