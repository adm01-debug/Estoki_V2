/**
 * Circuit Breaker Pattern
 *
 * Protects external integrations (Bitrix24, Correios, Lalamove, etc.)
 * from cascading failures. When an integration fails repeatedly,
 * the circuit opens and fast-fails subsequent calls for a cooldown period.
 *
 * States: CLOSED → OPEN → HALF_OPEN → CLOSED
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  /** Max consecutive failures before opening (default: 5) */
  failureThreshold?: number;
  /** Cooldown in ms before attempting half-open (default: 30_000) */
  resetTimeout?: number;
  /** Name for logging */
  name: string;
}

interface CircuitStats {
  state: CircuitState;
  failures: number;
  lastFailure: number | null;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private lastFailure: number | null = null;
  private totalCalls = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly name: string;

  constructor(options: CircuitBreakerOptions) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30_000;
    this.name = options.name;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        if (import.meta.env.DEV) {
          console.log(`[CircuitBreaker:${this.name}] HALF_OPEN — testing...`);
        }
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker "${this.name}" is OPEN. Retry after ${this.getRemainingCooldown()}ms.`,
          this.name,
          this.getStats(),
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /** Returns true if safe to call, false if circuit is open */
  isAvailable(): boolean {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'HALF_OPEN') return true;
    return this.shouldAttemptReset();
  }

  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /** Force reset to CLOSED (e.g. manual admin action) */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailure = null;
    if (import.meta.env.DEV) {
      console.log(`[CircuitBreaker:${this.name}] manually RESET to CLOSED`);
    }
  }

  private onSuccess(): void {
    this.totalSuccesses++;
    if (this.state === 'HALF_OPEN') {
      if (import.meta.env.DEV) {
        console.log(`[CircuitBreaker:${this.name}] HALF_OPEN → CLOSED (success)`);
      }
    }
    this.state = 'CLOSED';
    this.failures = 0;
  }

  private onFailure(): void {
    this.totalFailures++;
    this.failures++;
    this.lastFailure = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      if (import.meta.env.DEV) {
        console.log(`[CircuitBreaker:${this.name}] HALF_OPEN → OPEN (failed again)`);
      }
      return;
    }

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      if (import.meta.env.DEV) {
        console.log(
          `[CircuitBreaker:${this.name}] CLOSED → OPEN after ${this.failures} failures`,
        );
      }
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailure) return false;
    return Date.now() - this.lastFailure >= this.resetTimeout;
  }

  private getRemainingCooldown(): number {
    if (!this.lastFailure) return 0;
    return Math.max(0, this.resetTimeout - (Date.now() - this.lastFailure));
  }
}

export class CircuitBreakerError extends Error {
  readonly circuitName: string;
  readonly stats: CircuitStats;

  constructor(message: string, circuitName: string, stats: CircuitStats) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    this.stats = stats;
  }
}

// ── Pre-configured instances for known integrations ────────
export const circuits = {
  bitrix24: new CircuitBreaker({ name: 'Bitrix24', failureThreshold: 5, resetTimeout: 60_000 }),
  correios: new CircuitBreaker({ name: 'Correios', failureThreshold: 3, resetTimeout: 45_000 }),
  lalamove: new CircuitBreaker({ name: 'Lalamove', failureThreshold: 5, resetTimeout: 30_000 }),
  sefaz: new CircuitBreaker({ name: 'SEFAZ', failureThreshold: 3, resetTimeout: 60_000 }),
  ai: new CircuitBreaker({ name: 'AI/LLM', failureThreshold: 3, resetTimeout: 30_000 }),
} as const;

/**
 * Usage:
 *
 * import { circuits } from '@/lib/circuit-breaker';
 *
 * const data = await circuits.bitrix24.execute(() =>
 *   fetch('https://bitrix24.example.com/api/...').then(r => r.json())
 * );
 */
