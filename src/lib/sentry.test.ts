import { describe, it, expect, vi } from 'vitest';
import { initSentry, captureException, captureMessage } from './sentry';

describe('sentry', () => {
  it('should have sentry methods', () => {
    expect(captureException).toBeDefined();
    expect(captureMessage).toBeDefined();
  });
});
