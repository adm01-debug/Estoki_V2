import { describe, it, expect, vi } from 'vitest';
import { authMiddleware, adminMiddleware } from './index';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '1' } } } }) },
    from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { role: 'admin' } }) })) })) }))
  }
}));

describe('middleware', () => {
  it('should check auth', async () => {
    const result = await authMiddleware();
    expect(result).toBe(true);
  });
});
