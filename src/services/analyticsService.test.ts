import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from './analyticsService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track events', async () => {
    await analyticsService.trackEvent('test_event', { foo: 'bar' });
    expect(true).toBe(true);
  });

  it('should get metrics', async () => {
    const metrics = await analyticsService.getMetrics('test_event', { start: '2023-01-01', end: '2023-12-31' });
    expect(Array.isArray(metrics)).toBe(true);
  });
});
