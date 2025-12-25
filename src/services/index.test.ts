import { describe, it, expect } from 'vitest';
import * as Services from './index';

describe('Services Index', () => {
  it('should export multiple services', () => {
    const exports = Object.keys(Services);
    expect(exports.length).toBeGreaterThan(10);
  });

  it('should export api service', () => {
    expect(Services.apiService || Services.api).toBeDefined();
  });
});
