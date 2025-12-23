import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import DailyChallenge from './DailyChallenge';

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('DailyChallenge', () => {
  it('should render without errors', () => {
    const { container } = render(<DailyChallenge />);
    expect(container).toBeInTheDocument();
  });
});
