import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import LevelUpAnimation from './LevelUpAnimation';

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('LevelUpAnimation', () => {
  it('should render without errors', () => {
    const { container } = render(<LevelUpAnimation />);
    expect(container).toBeInTheDocument();
  });
});
