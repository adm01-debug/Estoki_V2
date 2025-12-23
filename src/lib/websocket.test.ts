import { describe, it, expect } from 'vitest';
import { wsManager } from './websocket';

describe('websocket', () => {
  it('should have subscribe method', () => {
    expect(typeof wsManager.subscribe).toBe('function');
  });

  it('should have send method', () => {
    expect(typeof wsManager.send).toBe('function');
  });

  it('should have disconnect method', () => {
    expect(typeof wsManager.disconnect).toBe('function');
  });
});
