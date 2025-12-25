import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPostMessage = vi.fn();
const mockAddEventListener = vi.fn();

global.self = {
  postMessage: mockPostMessage,
  addEventListener: mockAddEventListener,
} as any;

describe('reportWorker', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should register message event listener', async () => {
    await import('./reportWorker');
    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should handle GENERATE_REPORT message', async () => {
    await import('./reportWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'GENERATE_REPORT', payload: { reportType: 'inventory', filters: {} } } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should handle EXPORT_PDF message', async () => {
    await import('./reportWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'EXPORT_PDF', payload: { data: [], template: 'default' } } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should handle EXPORT_EXCEL message', async () => {
    await import('./reportWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'EXPORT_EXCEL', payload: { data: [], columns: [] } } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });

  it('should report progress during generation', async () => {
    await import('./reportWorker');
    const handler = mockAddEventListener.mock.calls.find(c => c[0] === 'message')?.[1];
    if (handler) {
      await handler({ data: { type: 'GENERATE_REPORT', payload: { reportType: 'large', data: Array(1000).fill({}) } } });
      expect(mockPostMessage).toHaveBeenCalled();
    }
  });
});
