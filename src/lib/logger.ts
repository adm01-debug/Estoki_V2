/**
 * Structured Logger — silences debug/info in production, keeps warn/error.
 * Outputs structured JSON-like entries with timestamp and context.
 */
type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel = import.meta.env.PROD ? "warn" : "debug";
  private context: string;

  constructor(context = "App") {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private format(level: LogLevel, message: string): string {
    const ts = new Date().toISOString();
    return `[${ts}] [${level.toUpperCase()}] [${this.context}] ${message}`;
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("debug")) console.debug(this.format("debug", message), data ?? "");
  }

  info(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("info")) console.info(this.format("info", message), data ?? "");
  }

  warn(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog("warn")) console.warn(this.format("warn", message), data ?? "");
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message), error, data ?? "");
    }
  }

  setLevel(level: LogLevel) {
    this.minLevel = level;
  }

  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

/**
 * Create a scoped logger.
 * @example
 * const log = createLogger('AuthService');
 * log.info('User logged in', { userId: '123' });
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export const logger = new Logger();
export type { LogLevel };