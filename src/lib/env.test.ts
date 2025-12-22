import { describe, it, expect } from 'vitest';
import { getEnv, isDev, isProd } from './env';

describe('env', () => {
  it('should get env variable', () => {
    expect(getEnv).toBeDefined();
  });
  it('should check dev mode', () => {
    expect(typeof isDev()).toBe('boolean');
  });
});
