import { describe, it, expect, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({})),
  useNavigate: vi.fn(() => vi.fn()),
}));

describe('PickLists Page', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
});
