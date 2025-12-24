/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

interface OfflineMessage {
  type: 'QUEUE_ACTION' | 'PROCESS_QUEUE' | 'GET_QUEUE' | 'CLEAR_QUEUE';
  payload?: any;
}

interface OfflineAction {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

const STORAGE_KEY = 'offline_queue';
let queue: OfflineAction[] = [];

// Load queue from storage on init
loadQueue();

self.onmessage = async (event: MessageEvent<OfflineMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'QUEUE_ACTION':
      if (payload) {
        const action: OfflineAction = {
          id: generateId(),
          action: payload.action,
          data: payload.data,
          timestamp: Date.now(),
          synced: false,
        };
        queue.push(action);
        saveQueue();
        self.postMessage({ type: 'ACTION_QUEUED', payload: action });
      }
      break;

    case 'PROCESS_QUEUE':
      await processQueue();
      break;

    case 'GET_QUEUE':
      self.postMessage({ type: 'QUEUE_STATUS', payload: { queue, count: queue.length } });
      break;

    case 'CLEAR_QUEUE':
      queue = [];
      saveQueue();
      self.postMessage({ type: 'QUEUE_CLEARED' });
      break;
  }
};

async function processQueue() {
  const pending = queue.filter(a => !a.synced);
  
  if (pending.length === 0) {
    self.postMessage({ type: 'QUEUE_EMPTY' });
    return;
  }

  self.postMessage({ type: 'PROCESSING_START', payload: { count: pending.length } });

  let processed = 0;
  let errors = 0;

  for (const action of pending) {
    try {
      const response = await fetch('/api/v1/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });

      if (response.ok) {
        action.synced = true;
        processed++;
      } else {
        errors++;
      }
    } catch (error) {
      errors++;
    }

    self.postMessage({ 
      type: 'PROCESSING_PROGRESS', 
      payload: { processed, errors, remaining: pending.length - processed - errors } 
    });
  }

  // Remove synced items
  queue = queue.filter(a => !a.synced);
  saveQueue();

  self.postMessage({ 
    type: 'PROCESSING_COMPLETE', 
    payload: { processed, errors, remaining: queue.length } 
  });
}

function loadQueue() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      queue = JSON.parse(stored);
    }
  } catch (error) {
    queue = [];
  }
}

function saveQueue() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save offline queue:', error);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export {};
