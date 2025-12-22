import { describe, it, expect } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  it('should have log methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
  });
});
