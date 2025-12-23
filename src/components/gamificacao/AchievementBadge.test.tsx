import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AchievementBadge from './AchievementBadge';

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AchievementBadge', () => {
  it('should render without errors', () => {
    const { container } = render(<AchievementBadge />);
    expect(container).toBeInTheDocument();
  });
});
