import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XPBar } from './XPBar';

describe('XPBar', () => {
  it('should render XP progress', () => {
    render(<XPBar currentXP={500} maxXP={1000} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show percentage', () => {
    render(<XPBar currentXP={500} maxXP={1000} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });
});
