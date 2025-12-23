import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';

vi.mock('./use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('useNotifications', () => {
  it('should start with empty notifications', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      result.current.addNotification({
        title: 'Test',
        message: 'Message',
        type: 'info',
      });
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });
});
