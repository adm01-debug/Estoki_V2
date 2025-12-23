import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Leaderboard from './Leaderboard';

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Leaderboard', () => {
  it('should render without errors', () => {
    const { container } = render(<Leaderboard />);
    expect(container).toBeInTheDocument();
  });
});
