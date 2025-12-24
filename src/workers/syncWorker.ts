/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

interface SyncMessage {
  type: 'SYNC_START' | 'SYNC_ITEM' | 'SYNC_COMPLETE' | 'SYNC_ERROR';
  payload?: any;
}

interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retries: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

let isProcessing = false;
const queue: QueueItem[] = [];

self.onmessage = async (event: MessageEvent<SyncMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SYNC_START':
      if (!isProcessing) {
        processQueue();
      }
      break;

    case 'SYNC_ITEM':
      if (payload) {
        queue.push({
          ...payload,
          timestamp: Date.now(),
          retries: 0,
        });
        if (!isProcessing) {
          processQueue();
        }
      }
      break;
  }
};

async function processQueue() {
  if (queue.length === 0) {
    isProcessing = false;
    self.postMessage({ type: 'SYNC_COMPLETE', payload: { processed: 0 } });
    return;
  }

  isProcessing = true;
  let processed = 0;
  let failed = 0;

  while (queue.length > 0) {
    const item = queue[0];
    
    try {
      await syncItem(item);
      queue.shift();
      processed++;
      self.postMessage({ 
        type: 'SYNC_PROGRESS', 
        payload: { processed, remaining: queue.length } 
      });
    } catch (error) {
      item.retries++;
      if (item.retries >= MAX_RETRIES) {
        queue.shift();
        failed++;
        self.postMessage({ 
          type: 'SYNC_ERROR', 
          payload: { item, error: String(error) } 
        });
      } else {
        await delay(RETRY_DELAY * item.retries);
      }
    }
  }

  isProcessing = false;
  self.postMessage({ 
    type: 'SYNC_COMPLETE', 
    payload: { processed, failed } 
  });
}

async function syncItem(item: QueueItem): Promise<void> {
  const baseUrl = '/api/v1';
  const url = `${baseUrl}/${item.entity}${item.type === 'update' || item.type === 'delete' ? `/${item.data.id}` : ''}`;
  
  const method = item.type === 'create' ? 'POST' : item.type === 'update' ? 'PUT' : 'DELETE';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: item.type !== 'delete' ? JSON.stringify(item.data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {};
