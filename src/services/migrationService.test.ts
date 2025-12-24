import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: {}, error: null }) })) },
}));

describe('migrationService', () => {
  it('should be defined', async () => {
    const mod = await import('./migrationService');
    expect(mod).toBeDefined();
  });
});
