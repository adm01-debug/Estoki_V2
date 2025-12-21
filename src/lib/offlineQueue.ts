// Queue utility for offline operations
interface QueueItem<T> {
  id: string;
  action: string;
  data: T;
  timestamp: number;
  retries: number;
}

class OfflineQueue<T> {
  private storageKey = "offline-queue";

  private getQueue(): QueueItem<T>[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveQueue(queue: QueueItem<T>[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
  }

  add(action: string, data: T): string {
    const queue = this.getQueue();
    const id = Math.random().toString(36).slice(2);
    queue.push({ id, action, data, timestamp: Date.now(), retries: 0 });
    this.saveQueue(queue);
    return id;
  }

  remove(id: string): void {
    const queue = this.getQueue().filter(item => item.id !== id);
    this.saveQueue(queue);
  }

  getAll(): QueueItem<T>[] {
    return this.getQueue();
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  incrementRetry(id: string): void {
    const queue = this.getQueue();
    const item = queue.find(i => i.id === id);
    if (item) item.retries++;
    this.saveQueue(queue);
  }
}

export const offlineQueue = new OfflineQueue();
