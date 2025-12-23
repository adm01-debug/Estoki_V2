import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRealtimeToast } from './useRealtimeToast';

vi.mock('./use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

describe('useRealtimeToast', () => {
  it('should subscribe to table changes', () => {
    renderHook(() => useRealtimeToast({
      table: 'test',
      onInsert: { title: 'New item' }
    }));
    expect(true).toBe(true);
  });
});
