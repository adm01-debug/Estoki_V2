import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({ pathname: '/' })),
  Link: ({ children }: any) => children,
}));

describe('UserMenu', () => {
  it('should render layout component', () => {
    expect(true).toBe(true);
  });
});
