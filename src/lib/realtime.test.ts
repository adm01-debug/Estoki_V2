import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })), removeChannel: vi.fn() }
}));

import { createRealtimeChannel, removeChannel } from './realtime';

describe('realtime', () => {
  it('should create channel', () => {
    const channel = createRealtimeChannel('test', 'table', vi.fn());
    expect(channel).toBeDefined();
  });
});
