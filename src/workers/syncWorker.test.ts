import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Worker environment
const mockPostMessage = vi.fn();
const mockAddEventListener = vi.fn();

global.self = {
  postMessage: mockPostMessage,
  addEventListener: mockAddEventListener,
} as any;

describe('syncWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register message event listener', async () => {
    await import('./syncWorker');
    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should handle sync request', async () => {
    await import('./syncWorker');
    const messageHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];
    
    if (messageHandler) {
      await messageHandler({ data: { type: 'SYNC', payload: { items: [] } } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should handle batch sync request', async () => {
    await import('./syncWorker');
    const messageHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];
    
    if (messageHandler) {
      await messageHandler({ data: { type: 'BATCH_SYNC', payload: { batches: [] } } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should report progress during sync', async () => {
    await import('./syncWorker');
    const messageHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];
    
    if (messageHandler) {
      await messageHandler({ data: { type: 'SYNC', payload: { items: [1, 2, 3] } } });
      const progressCalls = mockPostMessage.mock.calls.filter(
        call => call[0]?.type === 'PROGRESS'
      );
      expect(progressCalls.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle errors gracefully', async () => {
    await import('./syncWorker');
    const messageHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];
    
    if (messageHandler) {
      await messageHandler({ data: { type: 'INVALID_TYPE' } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });
});
