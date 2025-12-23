import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ limit: vi.fn().mockResolvedValue({ error: null }) })) })) }
}));

import { checkHealth } from './healthcheck';

describe('healthcheck', () => {
  it('should return health status', async () => {
    const status = await checkHealth();
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('database');
    expect(status).toHaveProperty('api');
    expect(status).toHaveProperty('timestamp');
  });
});
