// Rate limiting utility
class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  canProceed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let timestamps = this.timestamps.get(key) || [];
    timestamps = timestamps.filter(t => t > windowStart);
    
    if (timestamps.length >= maxRequests) {
      return false;
    }
    
    timestamps.push(now);
    this.timestamps.set(key, timestamps);
    return true;
  }

  getRemainingRequests(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = (this.timestamps.get(key) || []).filter(t => t > windowStart);
    return Math.max(0, maxRequests - timestamps.length);
  }

  getResetTime(key: string, windowMs: number): number {
    const timestamps = this.timestamps.get(key) || [];
    if (timestamps.length === 0) return 0;
    return timestamps[0] + windowMs - Date.now();
  }
}

export const rateLimiter = new RateLimiter();
