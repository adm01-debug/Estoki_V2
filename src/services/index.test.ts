import { describe, it, expect } from 'vitest';
import * as Services from './index';

describe('Services Index', () => {
  it('should export createServices factory', () => {
    expect(Services.createServices).toBeDefined();
    expect(typeof Services.createServices).toBe('function');
  });

  it('createServices returns an object', () => {
    const services = Services.createServices();
    expect(typeof services).toBe('object');
  });
});
