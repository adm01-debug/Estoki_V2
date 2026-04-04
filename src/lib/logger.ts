/**
 * Structured Logger — Production-grade logging utility
 *
 * - DEV: Pretty-printed console with colors
 * - PROD: JSON structured logs (warn/error only) with PII masking
 * - Supports correlation IDs, child loggers, and timing
 *
 * @example
 *   const log = createLogger('AuthService');
 *   log.info('User logged in', { userId: '123' });
 *   log.error('Failed', { error: err });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// PII field names to mask in production logs
const PII_FIELDS = new Set([
  'password', 'senha', 'token', 'secret', 'apikey', 'api_key',
  'cpf', 'cnpj', 'authorization', 'cookie', 'session',
]);

function maskPII(obj: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (PII_FIELDS.has(key.toLowerCase())) {
      masked[key] = '***';
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Error)) {
      masked[key] = maskPII(value as Record<string, unknown>);
    } else if (value instanceof Error) {
      masked[key] = { message: value.message, name: value.name, stack: value.stack?.split('\n').slice(0, 3).join('\n') };
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

class Logger {
  private minLevel: LogLevel = import.meta.env.PROD ? "warn" : "debug";
  private context: string;
  private requestId: string | null = null;
  private userId: string | null = null;

  constructor(context = "App") {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  /** Set correlation ID for distributed tracing */
  setRequestId(id: string): this {
    this.requestId = id;
    return this;
  }

  /** Set user context */
  setUser(userId: string): this {
    this.userId = userId;
    return this;
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("debug")) this.emit("debug", message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("info")) this.emit("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("warn")) this.emit("warn", message, data);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    if (this.shouldLog("error")) {
      const errorData = error instanceof Error
        ? { errorName: error.name, errorMessage: error.message, stack: error.stack?.split('\n').slice(0, 5).join('\n') }
        : error ? { error: String(error) } : {};
      this.emit("error", message, { ...errorData, ...data });
    }
  }

  /** Measure execution time */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = Math.round(performance.now() - start);
      this.info(`${label}`, { duration_ms: duration });
    };
  }

  setLevel(level: LogLevel) {
    this.minLevel = level;
  }

  child(context: string): Logger {
    const child = new Logger(`${this.context}:${context}`);
    child.requestId = this.requestId;
    child.userId = this.userId;
    return child;
  }

  private emit(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const safeData = data ? maskPII(data) : undefined;

    if (import.meta.env.DEV) {
      // Pretty console output in development
      const colors: Record<LogLevel, string> = {
        debug: '#888', info: '#2196F3', warn: '#FF9800', error: '#F44336',
      };
      const prefix = `%c[${this.context}]`;
      const style = `color: ${colors[level]}; font-weight: bold`;
      const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'debug' ? console.debug : console.info;
      if (safeData) {
        fn(prefix, style, message, safeData);
      } else {
        fn(prefix, style, message);
      }
    } else {
      // Structured JSON in production
      const entry = {
        ts: new Date().toISOString(),
        level,
        ctx: this.context,
        msg: message,
        ...(safeData && { data: safeData }),
        ...(this.requestId && { rid: this.requestId }),
        ...(this.userId && { uid: this.userId }),
      };
      const fn = level === 'error' ? console.error : console.warn;
      fn(JSON.stringify(entry));
    }
  }
}

/** Create a scoped logger */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export const logger = new Logger();
export type { LogLevel };
