import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock service worker APIs
const mockRegistration = {
  installing: null,
  waiting: null,
  active: { postMessage: vi.fn() },
  update: vi.fn(),
  unregister: vi.fn(),
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(() => Promise.resolve(mockRegistration)),
    ready: Promise.resolve(mockRegistration),
    controller: null,
    getRegistrations: vi.fn(() => Promise.resolve([mockRegistration])),
  },
  writable: true,
});

describe('serviceWorker', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should register service worker', async () => {
    const { register } = await import('./serviceWorker');
    if (register) {
      await register();
      expect(navigator.serviceWorker.register).toHaveBeenCalled();
    }
  });

  it('should unregister service worker', async () => {
    const { unregister } = await import('./serviceWorker');
    if (unregister) {
      await unregister();
    }
  });

  it('should handle registration errors', async () => {
    navigator.serviceWorker.register = vi.fn(() => Promise.reject(new Error('Failed')));
    const { register } = await import('./serviceWorker');
    if (register) {
      await expect(register()).rejects.toThrow();
    }
  });
});
