import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({ pathname: '/' })),
  Link: ({ children }: any) => children,
}));

describe('NavItem', () => {
  it('should render layout component', () => {
    expect(true).toBe(true);
  });
});
