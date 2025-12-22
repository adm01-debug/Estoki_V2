import { describe, it, expect } from 'vitest';
import { exportData } from './export';

describe('export', () => {
  it('should export data', () => {
    expect(exportData).toBeDefined();
  });
});
