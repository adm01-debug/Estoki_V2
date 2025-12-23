import { describe, it, expect, vi } from 'vitest';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn()
}));

import { logError, logMessage, setUserContext, clearUserContext, trackPerformance } from './monitoring';

describe('monitoring', () => {
  it('should log error', () => {
    expect(() => logError(new Error('test'))).not.toThrow();
  });

  it('should log message', () => {
    expect(() => logMessage('test message')).not.toThrow();
  });

  it('should set user context', () => {
    expect(() => setUserContext('user-123', 'test@test.com')).not.toThrow();
  });

  it('should clear user context', () => {
    expect(() => clearUserContext()).not.toThrow();
  });

  it('should track performance', () => {
    expect(() => trackPerformance('test', () => {})).not.toThrow();
  });
});
