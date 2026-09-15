import { rateLimiter as _rateLimiter } from "./rateLimiter";

export { rateLimiter } from "./rateLimiter";

export const rateLimit = (key: string, limit: number, windowMs: number): boolean =>
  _rateLimiter.canProceed(key, limit, windowMs);

export const clearRateLimit = (key: string): void => _rateLimiter.clear(key);
