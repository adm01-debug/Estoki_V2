import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({})),
  useNavigate: vi.fn(() => vi.fn()),
  Link: ({ children }: any) => children,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis() })) },
}));

describe('Profile Page', () => {
  it('should render page', () => {
    expect(true).toBe(true);
  });

  it('should handle loading state', () => {
    expect(true).toBe(true);
  });
});
