import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePushNotifications } from './usePushNotifications';

describe('usePushNotifications', () => {
  it('should check notification permission', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default', requestPermission: vi.fn().mockResolvedValue('granted') },
      writable: true
    });
    const { result } = renderHook(() => usePushNotifications());
    expect(result.current.permission).toBeDefined();
  });

  it('should handle unsupported browsers', () => {
    const originalNotification = window.Notification;
    delete (window as any).Notification;
    const { result } = renderHook(() => usePushNotifications());
    expect(result.current.isSupported).toBe(false);
    (window as any).Notification = originalNotification;
  });
});
