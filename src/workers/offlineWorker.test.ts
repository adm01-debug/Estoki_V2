import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPostMessage = vi.fn();
const mockAddEventListener = vi.fn();

global.self = {
  postMessage: mockPostMessage,
  addEventListener: mockAddEventListener,
} as any;

describe('offlineWorker', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should register message event listener', async () => {
    await import('./offlineWorker');
    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should handle QUEUE_REQUEST message', async () => {
    await import('./offlineWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'QUEUE_REQUEST', payload: { url: '/api/test', method: 'POST' } } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should handle PROCESS_QUEUE message', async () => {
    await import('./offlineWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'PROCESS_QUEUE' } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should handle CLEAR_QUEUE message', async () => {
    await import('./offlineWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'CLEAR_QUEUE' } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should handle GET_QUEUE_STATUS message', async () => {
    await import('./offlineWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'GET_QUEUE_STATUS' } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });
});
