import { describe, it, expect } from 'vitest';
import * as Workers from './index';

describe('Workers Index', () => {
  it('should export syncWorker', () => {
    expect(Workers.syncWorker || Workers.createSyncWorker).toBeDefined();
  });

  it('should export offlineWorker', () => {
    expect(Workers.offlineWorker || Workers.createOfflineWorker).toBeDefined();
  });

  it('should export reportWorker', () => {
    expect(Workers.reportWorker || Workers.createReportWorker).toBeDefined();
  });

  it('should have worker creation utilities', () => {
    const exports = Object.keys(Workers);
    expect(exports.length).toBeGreaterThan(0);
  });
});
