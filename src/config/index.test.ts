import { describe, it, expect } from 'vitest';
import * as Config from './index';

describe('Config Index', () => {
  it('should export configuration objects', () => {
    const exports = Object.keys(Config);
    expect(exports.length).toBeGreaterThan(0);
  });

  it('should export routes config', () => {
    expect(Config.routes || Config.ROUTES).toBeDefined();
  });

  it('should export menu config', () => {
    expect(Config.menu || Config.MENU).toBeDefined();
  });
});
