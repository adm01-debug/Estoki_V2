type WebSocketCallback = (data: any) => void;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private callbacks: Map<string, WebSocketCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string): void {
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handlers = this.callbacks.get(data.type) || [];
      handlers.forEach(cb => cb(data.payload));
    };
    this.socket.onclose = () => this.reconnect(url);
  }

  private reconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts);
    }
  }

  subscribe(type: string, callback: WebSocketCallback): void {
    const handlers = this.callbacks.get(type) || [];
    handlers.push(callback);
    this.callbacks.set(type, handlers);
  }

  send(type: string, payload: any): void {
    this.socket?.send(JSON.stringify({ type, payload }));
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }
}

export const wsManager = new WebSocketManager();
