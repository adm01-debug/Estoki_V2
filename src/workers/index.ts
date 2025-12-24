// Web Workers for background processing
// Usage: const worker = new Worker(new URL('./syncWorker.ts', import.meta.url), { type: 'module' });

export const createSyncWorker = () => 
  new Worker(new URL('./syncWorker.ts', import.meta.url), { type: 'module' });

export const createOfflineWorker = () => 
  new Worker(new URL('./offlineWorker.ts', import.meta.url), { type: 'module' });

export const createReportWorker = () => 
  new Worker(new URL('./reportWorker.ts', import.meta.url), { type: 'module' });
